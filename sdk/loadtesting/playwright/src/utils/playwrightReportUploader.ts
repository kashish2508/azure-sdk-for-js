// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BlobServiceClient } from "@azure/storage-blob";
import {
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
  createReadStream,
  writeFileSync,
} from "fs";
import { join, relative } from "path";
import { UploadConstants } from "../common/constants.js";
import { populateValuesFromServiceUrl, extractStorageAccountName } from "./utils.js";
import { PlaywrightServiceApiCall } from "./playwrightServiceApicall.js";
import { PlaywrightServiceConfig } from "../common/playwrightServiceConfig.js";

/**
 * PlaywrightReportUploader - Dedicated Azure Storage upload handler for HTML reports
 *
 * This class is specifically responsible for uploading Playwright HTML reports to Azure Blob Storage
 * with optimal parallel processing and performance optimizations.
 *
 * Key Features:
 * - Intelligent concurrency control based on file characteristics
 * - Multiple upload strategies for different file sizes (small/medium/large)
 * - Batch processing with progress tracking and retry logic
 * - Azure SDK best practices for maximum upload performance
 *
 * Upload Flow Overview:
 * Setup -> File Discovery -> Concurrency Optimization -> Batch Execution ->
 * Individual Upload -> Progress Monitoring -> Completion
 */
export class PlaywrightReportUploader {
  /**
   * MAIN ENTRY POINT: Uploads the entire HTML report folder to Azure Storage
   *
   * This is the primary entry point for HTML report uploads. It handles:
   * 1. Azure Blob Service Client initialization with managed identity
   * 2. Container name generation from workspace ID (extracted from service URL)
   * 3. Container creation/validation (one per workspace for isolation)
   * 4. Folder structure creation with timestamp and run ID for uniqueness
   * 5. Delegation to parallel upload engine for actual file processing
   *
   * Container Naming Strategy:
   * - Uses workspace ID from service URL for consistent container per workspace
   * - Normalizes container name to meet Azure naming requirements (lowercase, no special chars)
   * - Creates folder structure: {timestamp}_{runId}/ for each test run
   *
   * @param credential - The DefaultAzureCredential from options.credential (managed identity)
   * @param runId - The test run ID to create unique folder structure
   * @param outputFolder - The local path to the HTML report folder to upload
   * @returns Promise<void> - Completes when all files are uploaded successfully
   */
  async uploadHtmlReportFolder(
    credential: any,
    runId: string,
    outputFolder: string,
  ): Promise<void> {
    const playwrightServiceApiClient = new PlaywrightServiceApiCall();
    const workspaceDetails = await playwrightServiceApiClient.getWorkspaceDetailAPI();
    const StorageAccount = extractStorageAccountName(workspaceDetailsResult?.storageUri);
    const blobServiceClient = new BlobServiceClient(
      `https://${StorageAccount}.blob.core.windows.net`,
      credential,
    );

    const serviceUrlInfo = populateValuesFromServiceUrl();
    if (!serviceUrlInfo?.accountId) {
      throw new Error("Unable to extract workspace ID from service URL");
    }

    const containerName = serviceUrlInfo.accountId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const containerExists = await containerClient.exists();
    if (!containerExists) {
      await containerClient.create();
      console.log(`Created new container for this workspace: ${containerName}`);
    } else {
      console.log(`Using existing container for this workspace: ${containerName}`);
    }

    const timestamp = Date.now();
    const folderName = `${timestamp}_${runId}`;
    console.log(`Folder created for this run: ${folderName}`);

    // Step 1: Modify index.html to add service worker script
    await this.modifyIndexHtml(outputFolder);

    // Step 2: Upload all files including modified index.html
    await this.uploadFolderInParallel(containerClient, outputFolder, outputFolder, folderName);
  }

  /**
   * Modifies the index.html file to include service worker registration script.
   *
   * Adds a script tag just after the title tag in the head section that registers
   * the service worker for handling SAS token authentication.
   *
   * @param outputFolder - Path to the HTML report folder containing index.html
   */
  private async modifyIndexHtml(outputFolder: string): Promise<void> {
    const indexPath = join(outputFolder, "index.html");

    if (!existsSync(indexPath)) {
      console.warn("index.html not found, skipping service worker script injection");
      return;
    }

    try {
      let htmlContent = readFileSync(indexPath, "utf-8");

      // Service worker registration script
      const serviceWorkerScript = `
<script>
  // Modify trace links to point to trace.playwright.dev
  function modifyTraceLinks() {
    document.querySelectorAll('a[download="trace.zip"]').forEach(traceLink => {
      const originalHref = traceLink.getAttribute('href');
      if (originalHref && !traceLink.hasAttribute('data-trace-processed')) {
        // Mark as processed to avoid re-processing
        traceLink.setAttribute('data-trace-processed', 'true');

        // Construct the encoded URL from the trace download link
        const fullUrl = new URL(originalHref, window.location.href).toString();
        const encodedUrl = encodeURIComponent(fullUrl);
        const newHref = \`https://trace.playwright.dev/?trace=\${encodedUrl}\`;

        // Find the parent container and look for the screenshot anchor
        let parent = traceLink.parentElement;
        while (parent && parent !== document.body) {
          const screenshotLink = parent.querySelector('a img.screenshot');
          if (screenshotLink) {
            const screenshotAnchor = screenshotLink.parentElement;
            if (screenshotAnchor && screenshotAnchor.tagName === 'A') {
              screenshotAnchor.setAttribute('href', newHref);
              screenshotAnchor.setAttribute('target', '_blank');
              break;
            }
          }
          parent = parent.parentElement;
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Run immediately
    modifyTraceLinks();

    // Watch for dynamically added content
    const observer = new MutationObserver(() => {
      modifyTraceLinks();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
</script>`;

      // Find the title tag and add script after it
      const titleMatch = htmlContent.match(/<\/title>/i);
      if (titleMatch) {
        const insertPosition = titleMatch.index! + titleMatch[0].length;
        htmlContent =
          htmlContent.slice(0, insertPosition) +
          serviceWorkerScript +
          htmlContent.slice(insertPosition);

        // Write modified content back to file
        writeFileSync(indexPath, htmlContent, "utf-8");
        console.log("✅ Modified index.html to include service worker registration");
      } else {
        console.warn("Could not find </title> tag in index.html, skipping script injection");
      }
    } catch (error) {
      console.error("Error modifying index.html:", error);
      throw error;
    }
  }

  /**
   * PUBLIC API: Uploads the entire Playwright HTML report folder after tests complete.
   *
   * This is the main public interface for uploading HTML reports. It handles:
   * - Credential validation from PlaywrightServiceConfig
   * - Default folder name resolution ("playwright-report")
   * - Folder existence validation
   * - Delegation to main upload orchestration method
   *
   * @param outputFolderName - Optional custom folder name (defaults to "playwright-report")
   * @returns Promise<void> - Completes when all files are uploaded successfully
   */
  async uploadPlaywrightHtmlReportAfterTests(outputFolderName?: string): Promise<void> {
    const cred = PlaywrightServiceConfig.instance.credential;
    if (!cred) {
      throw new Error("No Azure credential available for HTML report upload");
    }

    const folderName = outputFolderName || "playwright-report";
    const outputFolderPath = join(process.cwd(), folderName);

    if (!existsSync(outputFolderPath)) {
      throw new Error(`HTML report folder not found: ${folderName}`);
    }

    const testRunId = PlaywrightServiceConfig.instance.runId;
    await this.uploadHtmlReportFolder(cred, testRunId, outputFolderPath);
  }

  /**
   * PHASE 2: Parallel Upload Engine - Core upload orchestration with performance optimization
   *
   * This function implements the heart of the parallel upload system with several key optimizations:
   *
   * 1. FILE DISCOVERY & ANALYSIS:
   *    - Recursively scans entire folder structure to build complete file inventory
   *    - Collects file metadata: size, path, content-type for optimization decisions
   *    - Sorts files by size (largest first) for optimal parallelization efficiency
   *
   * 2. CONCURRENCY OPTIMIZATION:
   *    - Calculates optimal concurrency based on file count, sizes, and characteristics
   *    - Uses proven Azure SDK concurrency patterns (base: 20, max: 50)
   *    - Adapts strategy for small files (high concurrency) vs large files (controlled concurrency)
   *
   * 3. PERFORMANCE TRACKING:
   *    - Measures total upload time and calculates throughput metrics
   *    - Tracks success/failure rates with detailed error reporting
   *    - Returns comprehensive statistics for monitoring and debugging
   *
   * 4. ERROR HANDLING:
   *    - Collects all upload results (success/failure) for complete visibility
   *    - Reports failed uploads with sample error messages for troubleshooting
   *    - Fails fast if any uploads fail to ensure data integrity
   *
   * @param containerClient - The Azure Blob container client for upload operations
   * @param folderPath - The local folder path to upload (HTML report root)
   * @param basePath - The base path for calculating relative blob names (maintains folder structure)
   * @param runIdFolderPrefix - Run ID prefix for creating unique folder structure in container
   * @returns Promise with upload statistics: files uploaded, total count, size, and timing
   */
  private async uploadFolderInParallel(
    containerClient: any,
    folderPath: string,
    basePath: string,
    runIdFolderPrefix?: string,
  ): Promise<{
    uploadedFiles: string[];
    totalFiles: number;
    totalSize: number;
    uploadTime: number;
  }> {
    // Sort by size descending - upload large files first for better parallelization
    const filesToUpload = this.collectAllFiles(folderPath, basePath, runIdFolderPrefix).sort(
      (a, b) => b.size - a.size,
    );

    if (filesToUpload.length === 0) {
      return { uploadedFiles: [], totalFiles: 0, totalSize: 0, uploadTime: 0 };
    }

    const totalSize = filesToUpload.reduce((sum, file) => sum + file.size, 0);

    const concurrency = this.calculateOptimalConcurrency(filesToUpload);
    const uploadStartTime = Date.now();
    const results = await this.uploadWithConcurrencyControl(
      containerClient,
      filesToUpload,
      concurrency,
    );

    const uploadEndTime = Date.now();
    const uploadTime = uploadEndTime - uploadStartTime;

    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed > 0) {
      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === "rejected")
        .map((r) => r.reason.message)
        .slice(0, 5); // Show first 5 errors

      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });

      throw new Error(
        `Upload failed: ${failed} files could not be uploaded. Sample errors: ${errors.join(", ")}`,
      );
    }

    const uploadedFiles = results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
      .map((r) => r.value);

    return {
      uploadedFiles,
      totalFiles: filesToUpload.length,
      totalSize,
      uploadTime,
    };
  }

  /**
   * PHASE 3: Concurrency Control System - Manages parallel execution with controlled resource usage
   *
   * This function implements a sophisticated task queue system that:
   *
   * 1. TASK QUEUE CREATION:
   *    - Wraps each file upload in an async task with error handling
   *    - Maintains original file order for consistent error reporting
   *    - Captures individual file errors with context (file path + error message)
   *
   * 2. SEMAPHORE-LIKE CONTROL:
   *    - Limits concurrent uploads to prevent Azure throttling and resource exhaustion
   *    - Uses Promise.race() pattern to maintain constant concurrency level
   *    - Automatically manages task lifecycle (start -> execute -> cleanup -> next)
   *
   * 3. DELEGATED EXECUTION:
   *    - Hands off to optimized batch processor for maximum performance
   *    - Uses proven Azure SDK patterns for reliable high-throughput uploads
   *    - Maintains error context through the entire execution chain
   *
   * @param containerClient - Azure container client for blob operations
   * @param files - Array of file metadata objects with paths, sizes, and content types
   * @param concurrency - Maximum number of simultaneous upload operations
   * @returns Promise with settled results array (fulfilled/rejected for each file)
   */
  private async uploadWithConcurrencyControl(
    containerClient: any,
    files: Array<{ fullPath: string; relativePath: string; size: number; contentType: string }>,
    concurrency: number,
  ): Promise<PromiseSettledResult<string>[]> {
    // Create a queue of upload tasks
    const uploadTasks = files.map((fileInfo) => async (): Promise<string> => {
      try {
        await this.uploadSingleFileOptimized(containerClient, fileInfo);
        return fileInfo.relativePath;
      } catch (error) {
        throw new Error(
          `${fileInfo.relativePath}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });

    // Execute with optimized batch processing for high performance
    return this.executeWithOptimizedBatching(uploadTasks, concurrency);
  }

  /**
   * PHASE 4: Optimized Batch Execution Engine - High-performance task processing system
   *
   * This is the performance-critical core that maximizes upload throughput through:
   *
   * 1. INTELLIGENT BATCHING:
   *    - Splits large task sets into optimal batch sizes (concurrency * 2)
   *    - Processes batches sequentially to maintain memory efficiency
   *    - Each batch runs with full concurrency for maximum parallelization
   *
   * 2. ADVANCED CONCURRENCY MANAGEMENT:
   *    - Uses Promise.race() to maintain exact concurrency limits
   *    - Automatically starts new tasks as others complete (rolling execution)
   *    - Tracks executing promises to prevent resource leaks
   *
   * 3. RESULT TRACKING:
   *    - Pre-allocates result array for O(1) insertion by index
   *    - Captures both successful results and error details
   *    - Maintains original task order despite parallel execution
   *
   * 4. PROGRESS MONITORING:
   *    - Counts completed tasks for progress tracking
   *    - Handles both successful and failed tasks in completion count
   *    - Provides foundation for progress reporting to users
   *
   * This pattern is based on Azure SDK internal implementations for maximum reliability.
   *
   * @param tasks - Array of async task functions to execute
   * @param concurrency - Maximum simultaneous task execution limit
   * @returns Promise with settled results maintaining original task order
   */
  private async executeWithOptimizedBatching<T>(
    tasks: Array<() => Promise<T>>,
    concurrency: number,
  ): Promise<PromiseSettledResult<T>[]> {
    const results: PromiseSettledResult<T>[] = new Array(tasks.length);
    let completedTasks = 0;

    // BATCH CREATION STRATEGY:
    // Splits tasks into optimal batches to balance memory usage vs. throughput
    // Batch size = min(configured limit, 2x concurrency) for optimal resource utilization
    const batchSize = Math.min(UploadConstants.BATCH_SIZE, concurrency * 2);
    const batches: Array<Array<() => Promise<T>>> = [];

    // Split task array into batches of optimal size
    // Each batch will be processed with full concurrency before moving to next batch
    for (let i = 0; i < tasks.length; i += batchSize) {
      batches.push(tasks.slice(i, i + batchSize));
    }

    // BATCH PROCESSING LOOP:
    // Process each batch sequentially to maintain memory efficiency
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchStartIndex = batchIndex * batchSize;

      // CREATE BATCH PROMISES:
      // Transform each task into a promise that captures results at correct index
      const batchPromises = batch.map(async (task, taskIndex) => {
        const globalIndex = batchStartIndex + taskIndex; // Maintain original task order
        try {
          const result = await task();
          results[globalIndex] = { status: "fulfilled", value: result };
          return result;
        } catch (error) {
          results[globalIndex] = { status: "rejected", reason: error };
          throw error;
        }
      });

      // CONCURRENCY CONTROL MECHANISM:
      // Maintains exactly 'concurrency' number of executing promises at all times
      const executing: Promise<any>[] = [];

      for (const promise of batchPromises) {
        // WAIT FOR SLOT AVAILABILITY:
        // If at max concurrency, wait for any promise to complete before starting new one
        if (executing.length >= concurrency) {
          await Promise.race(executing); // Wait for fastest promise to complete
        }

        // PROMISE LIFECYCLE MANAGEMENT:
        // Wrap promise with cleanup logic to maintain executing array
        const wrappedPromise = promise
          .then((result) => {
            completedTasks++; // Track successful completions for progress
            return result;
          })
          .catch(() => {
            completedTasks++; // Count failed tasks too for accurate progress
          })
          .finally(() => {
            // CLEANUP: Remove completed promise from executing array
            const index = executing.indexOf(wrappedPromise);
            if (index > -1) executing.splice(index, 1);
          });

        executing.push(wrappedPromise);
      }

      // BATCH COMPLETION:
      // Wait for all promises in current batch to complete before moving to next batch
      await Promise.allSettled(executing);
    }

    return results;
  }

  /**
   * PHASE 2.1: Intelligent Concurrency Optimization Algorithm
   *
   * This algorithm calculates the optimal concurrency level based on file characteristics
   * and Azure Storage performance patterns. It uses several key factors:
   *
   * 1. FILE ANALYSIS:
   *    - Total file count: More files can handle higher concurrency
   *    - Average file size: Small files benefit from high concurrency, large files need control
   *    - Total dataset size: Influences memory and bandwidth considerations
   *
   * 2. CONCURRENCY STRATEGIES:
   *    - Small datasets (≤10 files): Conservative approach, limit to file count
   *    - Small files (<1MB avg): Aggressive concurrency (up to 50) for maximum throughput
   *    - Large datasets (>1000 files): Scaled concurrency with file count consideration
   *    - Default case: Enhanced baseline (20) for balanced performance
   *
   * 3. AZURE STORAGE OPTIMIZATION:
   *    - Based on Azure SDK proven patterns and throttling limits
   *    - Balances throughput vs. resource usage vs. reliability
   *    - Prevents overwhelming Azure Storage endpoints
   *
   * 4. PERFORMANCE BOUNDARIES:
   *    - Base concurrency: 20 (proven high-performance baseline)
   *    - Maximum concurrency: 50 (prevents resource exhaustion)
   *    - Dynamic scaling based on workload characteristics
   *
   * @param files - Array of file objects with size information for analysis
   * @returns Optimal concurrency level (integer) for the given file set
   */
  private calculateOptimalConcurrency(files: Array<{ size: number }>): number {
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const avgFileSize = totalSize / totalFiles;

    // CONCURRENCY CALCULATION ALGORITHM:
    // Analyzes file characteristics to determine optimal parallel processing level
    let optimalConcurrency: number;

    if (totalFiles <= 10) {
      // SMALL DATASETS: Conservative approach for small file sets
      // Limits concurrency to actual file count (no over-provisioning)
      // Prevents resource waste when there aren't many files to process
      optimalConcurrency = Math.min(totalFiles, 10);
    } else if (avgFileSize < UploadConstants.SMALL_FILE_THRESHOLD) {
      // SMALL FILE OPTIMIZATION: High concurrency for small files (typically HTML assets)
      // Small files have low memory footprint and benefit from aggressive parallelization
      // Formula: Scale with file count but respect maximum limits
      // Minimum base concurrency (20) ensures good performance even for medium sets
      optimalConcurrency = Math.min(
        UploadConstants.MAX_CONCURRENCY,
        Math.max(UploadConstants.BASE_CONCURRENCY, totalFiles / 50),
      );
    } else if (totalFiles > 1000) {
      // LARGE DATASET OPTIMIZATION: Scaled concurrency for massive file sets
      // Increases concurrency based on file count to handle large reports efficiently
      // Formula: Base (20) + scaled increment based on file count
      // Prevents under-utilization when processing thousands of files
      optimalConcurrency = Math.min(
        UploadConstants.MAX_CONCURRENCY,
        UploadConstants.BASE_CONCURRENCY + Math.floor(totalFiles / 200),
      );
    } else {
      // MODERATE FILE SETS: Enhanced baseline for typical HTML reports
      // Uses proven baseline concurrency (20) that works well for most scenarios
      // Balances performance vs. resource usage for standard test reports
      optimalConcurrency = Math.min(
        UploadConstants.MAX_CONCURRENCY,
        UploadConstants.BASE_CONCURRENCY,
      );
    }

    // Ensure integer concurrency value for task allocation
    optimalConcurrency = Math.floor(optimalConcurrency);

    return optimalConcurrency;
  }

  /**
   * PHASE 2.0: File Discovery and Metadata Collection System
   *
   * This function performs comprehensive file system traversal to build a complete inventory
   * of all files that need to be uploaded. Key features:
   *
   * 1. NON-RECURSIVE TRAVERSAL:
   *    - Uses iterative stack-based approach instead of recursion
   *    - Prevents stack overflow on deep directory structures
   *    - More memory efficient for large folder hierarchies
   *
   * 2. COMPLETE METADATA COLLECTION:
   *    - Full file path for reading file contents
   *    - Relative path for blob naming (maintains folder structure in Azure)
   *    - File size for upload strategy optimization and progress tracking
   *    - Content type detection for proper HTTP headers and browser compatibility
   *
   * 3. PATH NORMALIZATION:
   *    - Converts Windows backslashes to forward slashes for Azure blob naming
   *    - Calculates relative paths from base to maintain folder structure
   *    - Optionally prefixes with run ID for unique folder organization
   *
   * 4. ROBUST ERROR HANDLING:
   *    - Skips directories with permission issues (graceful degradation)
   *    - Continues processing even if some folders are inaccessible
   *    - Ensures maximum file discovery success rate
   *
   * 5. AZURE FOLDER STRUCTURE:
   *    - Creates logical folder structure: {runIdPrefix}/{original/folder/structure/file.ext}
   *    - Maintains HTML report folder hierarchy for proper rendering
   *    - Ensures relative links in HTML work correctly after upload
   *
   * @param folderPath - Root folder to scan (HTML report directory)
   * @param basePath - Base path for calculating relative blob names
   * @param runIdFolderPrefix - Optional run ID for creating unique folder structure
   * @returns Array of complete file metadata objects ready for upload processing
   */
  private collectAllFiles(
    folderPath: string,
    basePath: string,
    runIdFolderPrefix?: string,
  ): Array<{
    fullPath: string;
    relativePath: string;
    size: number;
    contentType: string;
  }> {
    const files: Array<{
      fullPath: string;
      relativePath: string;
      size: number;
      contentType: string;
    }> = [];

    const stack = [folderPath];

    while (stack.length > 0) {
      const currentPath = stack.pop()!;

      try {
        const items = readdirSync(currentPath);

        for (const item of items) {
          const itemPath = join(currentPath, item);
          const stats = statSync(itemPath);

          if (stats.isDirectory()) {
            stack.push(itemPath); // Add directory to stack instead of recursing
          } else {
            // Simplified path calculation - normalize separators once
            let relativePath = relative(basePath, itemPath).split("\\").join("/");

            // If runIdFolderPrefix is provided, prepend it to create folder structure
            if (runIdFolderPrefix) {
              relativePath = `${runIdFolderPrefix}/${relativePath}`;
            }

            files.push({
              fullPath: itemPath,
              relativePath,
              size: stats.size,
              contentType: this.getContentType(itemPath),
            });
          }
        }
      } catch (error) {
        // Skip directories we can't read (permissions, etc.)
        continue;
      }
    }

    return files;
  }

  /**
   * PHASE 5: Individual File Upload with Retry Logic
   *
   * This function handles the upload of a single file with comprehensive error handling
   * and retry logic based on Azure SDK best practices:
   *
   * 1. RETRY STRATEGY:
   *    - Exponential backoff with jitter (Azure SDK standard pattern)
   *    - Base delay: 1000ms, doubles each retry with random jitter
   *    - Maximum 3 attempts to balance reliability vs. speed
   *    - Jitter prevents thundering herd when many files retry simultaneously
   *
   * 2. ERROR CONTEXT:
   *    - Preserves original error messages for debugging
   *    - Tracks attempt count in final error message
   *    - Provides clear failure context for troubleshooting
   *
   * 3. DELEGATION TO OPTIMIZED UPLOAD:
   *    - Hands off to strategy-based upload function
   *    - Different strategies based on file size (small/medium/large)
   *    - Uses Azure SDK internal optimizations for best performance
   *
   * 4. RELIABILITY FEATURES:
   *    - Handles transient Azure Storage errors (throttling, timeouts, network issues)
   *    - Only fails after exhausting all retry attempts
   *    - Maintains upload consistency across the entire file set
   *
   * @param containerClient - Azure Blob container client for upload operations
   * @param fileInfo - Complete file metadata (path, size, content-type, relative path)
   * @returns Promise that resolves when file is successfully uploaded
   */
  private async uploadSingleFileOptimized(
    containerClient: any,
    fileInfo: { fullPath: string; relativePath: string; contentType: string; size: number },
  ): Promise<void> {
    const blockBlobClient = containerClient.getBlockBlobClient(fileInfo.relativePath);
    const maxRetries = UploadConstants.MAX_RETRY_ATTEMPTS;
    const baseDelay = UploadConstants.RETRY_BASE_DELAY;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.performOptimizedUpload(blockBlobClient, fileInfo);

        // Success - exit retry loop
        return;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        if (isLastAttempt) {
          throw new Error(`Failed after ${maxRetries} attempts: ${errorMessage}`);
        }

        // Exponential backoff with jitter (Azure SDK pattern)
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Determines the content type based on file extension.
   *
   * @param filePath - The file path
   * @returns The MIME type
   */
  private getContentType(filePath: string): string {
    const ext = filePath.toLowerCase().split(".").pop();

    const contentTypes: { [key: string]: string } = {
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      json: "application/json",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      svg: "image/svg+xml",
      ico: "image/x-icon",
      txt: "text/plain",
      ttf: "font/ttf",
      woff: "font/woff",
      woff2: "font/woff2",
      webmanifest: "application/manifest+json",
      map: "application/json",
      xml: "application/xml",
      pdf: "application/pdf",
      zip: "application/zip",
    };

    return contentTypes[ext || ""] || "application/octet-stream";
  }

  /**
   * PHASE 6: Multi-Strategy Upload Engine - Optimized upload based on file characteristics
   *
   * This function implements three distinct upload strategies optimized for different file sizes,
   * based on Azure SDK internal optimizations and performance testing:
   *
   * STRATEGY 1 - DIRECT UPLOAD: Optimal for small files (≤1MB)
   * - Uses direct upload() method for minimal overhead
   * - Reads entire file into memory for fastest upload
   * - Best for HTML, CSS, JS files in reports
   * - Single HTTP request, lowest latency
   *
   * STRATEGY 2 - BLOCK UPLOAD: Optimal for medium files (1MB - 100MB)
   * - Uses uploadData() with optimized block size and concurrency
   * - Block size: 8MB (Azure SDK optimal size for throughput)
   * - Per-file concurrency: 10 (balances speed vs. resource usage)
   * - Automatic block-level parallelization by Azure SDK
   * - Best for larger assets, images, bundled files
   *
   * STRATEGY 3 - STREAMING UPLOAD: Optimal for large files (>100MB)
   * - Uses uploadStream() for memory-efficient streaming
   * - Stream buffer: 16MB for optimal network utilization
   * - High concurrency: 15 for maximum throughput on large transfers
   * - Prevents memory exhaustion on very large files
   * - Best for video files, large archives, or massive datasets
   *
   * COMMON FEATURES:
   * - All strategies set proper Content-Type headers for browser compatibility
   * - Uses Azure SDK internal optimizations (buffer pools, connection reuse)
   * - Automatic retry and error handling at the Azure SDK level
   * - Optimal performance tuned through extensive testing
   *
   * @param blockBlobClient - Azure Block Blob client for the specific file
   * @param fileInfo - File metadata including size for strategy selection
   * @returns Promise that completes when upload finishes successfully
   */
  private async performOptimizedUpload(
    blockBlobClient: any,
    fileInfo: { fullPath: string; relativePath: string; contentType: string; size: number },
  ): Promise<void> {
    if (fileInfo.size <= UploadConstants.SMALL_FILE_THRESHOLD) {
      // STRATEGY 1 - DIRECT UPLOAD: Optimal for small files (≤1MB)
      // - Single HTTP PUT request for minimal latency
      // - Entire file loaded into memory (acceptable for small files)
      // - Best performance for HTML, CSS, JS, and small image files
      // - No block-level parallelization overhead
      const fileContent = readFileSync(fileInfo.fullPath);
      await blockBlobClient.upload(fileContent, fileContent.length, {
        blobHTTPHeaders: {
          blobContentType: fileInfo.contentType, // Ensures proper MIME type for browsers
        },
      });
    } else if (fileInfo.size <= UploadConstants.LARGE_FILE_THRESHOLD) {
      // STRATEGY 2 - BLOCK UPLOAD: Optimal for medium files (1MB - 100MB)
      // - Automatic block-level parallelization by Azure SDK
      // - 8MB block size: Optimal balance of throughput vs. memory usage
      // - 10 concurrent blocks: Maximizes bandwidth without overwhelming endpoints
      // - Best for larger assets, bundled files, compressed archives
      const fileContent = readFileSync(fileInfo.fullPath);
      await blockBlobClient.uploadData(fileContent, {
        blobHTTPHeaders: {
          blobContentType: fileInfo.contentType,
        },
        blockSize: UploadConstants.OPTIMIZED_BLOCK_SIZE, // 8MB blocks
        concurrency: UploadConstants.PER_FILE_CONCURRENCY, // 10 parallel blocks
      });
    } else {
      // STRATEGY 3 - STREAMING UPLOAD: Optimal for large files (>100MB)
      // - Memory-efficient streaming prevents OOM on large files
      // - 16MB stream buffer: Optimal for network efficiency
      // - 15 concurrent streams: Maximum throughput for large transfers
      // - Best for video files, large datasets, massive archives
      const stream = createReadStream(fileInfo.fullPath);
      await blockBlobClient.uploadStream(
        stream,
        UploadConstants.STREAM_BUFFER_SIZE, // 16MB buffer
        UploadConstants.LARGE_FILE_CONCURRENCY, // 15 concurrent streams
        {
          blobHTTPHeaders: {
            blobContentType: fileInfo.contentType,
          },
        },
      );
    }
  }
}
