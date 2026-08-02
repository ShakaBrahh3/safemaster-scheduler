import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, X, AlertTriangle, Download, Eye } from 'lucide-react';

/**
 * ExcelUploadModal - Modal for uploading Excel files to import jobs
 * 
 * Features:
 * - File upload with drag and drop support
 * - Excel file preview before import
 * - Progress tracking
 * - Error handling and validation
 * - Template download
 */
export function ExcelUploadModal({ isOpen, onClose, onImportSuccess, api }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importOptions, setImportOptions] = useState({
    status: 'backlog',
    sheetIndex: 0
  });
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'preview'

  // Reset state when modal closes
  const resetState = useCallback(() => {
    setUploadedFile(null);
    setPreviewData(null);
    setError(null);
    setUploadProgress(0);
    setActiveTab('upload');
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  // Handle file selection
  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // Validate file and set it
  const validateAndSetFile = useCallback((file) => {
    setError(null);
    
    // Validate file type
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.slice(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension.toLowerCase())) {
      setError(`Invalid file type: ${fileExtension}. Supported formats: .xlsx, .xls, .csv`);
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError(`File size exceeds maximum limit of 5MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }
    
    setUploadedFile(file);
    setPreviewData(null);
    setActiveTab('upload');
  }, []);

  // Preview the uploaded Excel file
  const handlePreview = useCallback(async () => {
    if (!uploadedFile) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await api.previewExcelFile(uploadedFile, importOptions);
      if (result.ok) {
        setPreviewData(result);
        setActiveTab('preview');
      } else {
        setError(result.error || 'Failed to preview file');
      }
    } catch (err) {
      setError(err.message || 'Failed to preview file');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFile, importOptions, api]);

  // Upload and import the Excel file
  const handleImport = useCallback(async () => {
    if (!uploadedFile) return;
    
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      const result = await api.uploadExcelFile(uploadedFile, importOptions);
      
      if (result.ok) {
        // Show progress as we process
        setUploadProgress(100);
        
        // Notify parent component of successful import
        if (onImportSuccess) {
          onImportSuccess(result);
        }
        
        // Close modal after a brief delay to show success
        setTimeout(() => {
          handleClose();
        }, 1500);
        
        return;
      }
      
      setError(result.error || 'Failed to import file');
    } catch (err) {
      setError(err.message || 'Failed to import file');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFile, importOptions, api, onImportSuccess, handleClose]);

  // Download Excel template
  const handleDownloadTemplate = useCallback(async () => {
    try {
      await api.downloadExcelTemplate();
    } catch (err) {
      setError(err.message || 'Failed to download template');
    }
  }, [api]);

  // Remove uploaded file
  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setPreviewData(null);
    setActiveTab('upload');
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Import from Excel</h2>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {uploadedFile && (
          <div className="flex border-b border-gray-200 px-6">
            <button 
              className={`py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'upload' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('upload')}
              disabled={isLoading}
            >
              Upload
            </button>
            {previewData && (
              <button 
                className={`py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'preview' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('preview')}
                disabled={isLoading}
              >
                Preview ({previewData.jobs?.length || 0} jobs)
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 text-sm">{error}</p>
                <button 
                  className="text-red-600 text-xs font-medium mt-2 hover:underline"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadProgress === 100 && !error && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-700 text-sm font-medium">
                  Successfully imported Excel file!
                </p>
              </div>
            </div>
          )}

          {/* Upload Area */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {!uploadedFile ? (
                <>
                  {/* File Upload Area */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      isLoading ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                    onClick={() => !isLoading && document.getElementById('excel-upload-input').click()}
                    onDrop={!isLoading ? handleDrop : undefined}
                    onDragOver={!isLoading ? handleDragOver : undefined}
                  >
                    <input 
                      id="excel-upload-input"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    
                    <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {isLoading ? 'Uploading...' : 'Upload Excel File'}
                    </h3>
                    
                    <p className="text-gray-500 text-sm mb-4">
                      {isLoading ? 'Please wait while we process your file...' : 
                       'Drag & drop your .xlsx, .xls, or .csv file here, or click to browse'}
                    </p>
                    
                    <p className="text-xs text-gray-400">
                      Max file size: 5MB | Supported formats: XLSX, XLS, CSV
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      onClick={handleDownloadTemplate}
                      disabled={isLoading}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Template</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* File Selected */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-6 h-6 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                        </div>
                      </div>
                      <button 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={handleRemoveFile}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Import Options */}
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Import as:</label>
                        <select 
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={importOptions.status}
                          onChange={(e) => setImportOptions(prev => ({ ...prev, status: e.target.value }))}
                          disabled={isLoading}
                        >
                          <option value="backlog">Backlog</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button 
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handlePreview}
                      disabled={isLoading}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                    
                    <button 
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleImport}
                      disabled={isLoading}
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isLoading ? 'Importing...' : 'Import'}</span>
                    </button>
                    
                    <button 
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleRemoveFile}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && previewData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Preview: {previewData.jobs?.length || 0} jobs to be imported
                </h3>
                <button 
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => setActiveTab('upload')}
                  disabled={isLoading}
                >
                  Back to Upload
                </button>
              </div>

              {/* Preview Summary */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{previewData.jobs?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Status</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{importOptions.status}</p>
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.jobs?.slice(0, 10).map((job, index) => (
                      <tr key={job.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{job.site || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">${job.cost?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{job.run || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{job.requiredTicket || 'WAH'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 capitalize">{job.priority || 'normal'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {previewData.jobs?.length > 10 && (
                  <p className="text-sm text-gray-500 mt-2">
                    + {previewData.jobs.length - 10} more jobs not shown in preview
                  </p>
                )}
              </div>

              {/* Import Button */}
              <div className="flex justify-end">
                <button 
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleImport}
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4" />
                  <span>{isLoading ? 'Importing...' : `Import All ${previewData.jobs?.length || 0} Jobs`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isLoading && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Processing...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Tips */}
          {!uploadedFile && !isLoading && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 text-gray-600 mr-2" />
                Tips for Excel Import
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use the template for best results</li>
                <li>• First row should contain headers (Site, Cost, Run, Notes, etc.)</li>
                <li>• Data starts from the second row</li>
                <li>• Auto-detection: "EWP" or "elevating" → EWP ticket, "rope" → ROPE ticket</li>
                <li>• "Urgent" in notes → High priority</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExcelUploadModal;