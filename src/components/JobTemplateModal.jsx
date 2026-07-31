import React, { useState, useEffect } from 'react';
import { FileText, Save, X, Plus, Trash2, Tag, DollarSign, MapPin, Clock } from 'lucide-react';
import { TICKETS, RUN_STYLES } from '../constants';

/**
 * Modal for creating and managing job templates
 */
export const JobTemplateModal = ({
  showModal,
  setShowModal,
  templates,
  onSave,
  onDelete,
  crews
}) => {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'manage'
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    site: '',
    cost: '',
    run: 'SOUTHWEST RUN',
    notes: '',
    tags: [],
    ewpRequired: false,
    requiredTicket: 'WAH',
    priority: 'normal',
    duration: 60, // minutes
    crewId: crews[0]?.id || '',
    isDefault: false
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load template for editing
  useEffect(() => {
    if (activeTab === 'manage' && templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, [activeTab, templates, selectedTemplate]);

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setNewTemplate({ ...template });
  };

  // Handle save template
  const handleSaveTemplate = () => {
    if (!newTemplate.name) {
      alert('Please enter a template name');
      return;
    }
    
    const template = {
      ...newTemplate,
      id: newTemplate.id || `template-${Date.now()}`,
      cost: parseFloat(newTemplate.cost) || 0,
      createdAt: newTemplate.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(template);
    
    // Reset form
    setNewTemplate({
      name: '',
      site: '',
      cost: '',
      run: 'SOUTHWEST RUN',
      notes: '',
      tags: [],
      ewpRequired: false,
      requiredTicket: 'WAH',
      priority: 'normal',
      duration: 60,
      crewId: crews[0]?.id || '',
      isDefault: false
    });
    
    setActiveTab('manage');
  };

  // Handle delete template
  const handleDeleteTemplate = () => {
    if (selectedTemplate && confirm(`Delete template "${selectedTemplate.name}"?`)) {
      onDelete(selectedTemplate.id);
      setSelectedTemplate(null);
    }
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = e.target.value.trim();
      if (tag && !newTemplate.tags.includes(tag)) {
        setNewTemplate(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
      }
      e.target.value = '';
    }
  };

  // Remove tag
  const removeTag = (tag) => {
    setNewTemplate(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Handle cancel
  const handleCancel = () => {
    setShowModal(false);
    setActiveTab('create');
    setNewTemplate({
      name: '',
      site: '',
      cost: '',
      run: 'SOUTHWEST RUN',
      notes: '',
      tags: [],
      ewpRequired: false,
      requiredTicket: 'WAH',
      priority: 'normal',
      duration: 60,
      crewId: crews[0]?.id || '',
      isDefault: false
    });
    setSelectedTemplate(null);
    setSearchQuery('');
  };

  if (!showModal) return null;

  // Filter templates
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.site.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Job Templates
          </h3>
          <button 
            type="button"
            onClick={handleCancel}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1 gap-1">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'create' 
                ? 'bg-slate-800 text-teal-400 shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Template
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'manage' 
                ? 'bg-slate-800 text-teal-400 shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manage Templates ({templates.length})
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Create Template Tab */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              
              {/* Template Name */}
              <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  Template Name *
                </label>
                <input 
                  type="text"
                  placeholder="e.g., Standard Height Safety Check"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Site */}
              <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  Default Site
                </label>
                <input 
                  type="text"
                  placeholder="e.g., Client Site Name"
                  value={newTemplate.site}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, site: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                    <DollarSign className="h-3 w-3 inline mr-1" />
                    Cost
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-slate-400">$</span>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={newTemplate.cost}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, cost: e.target.value }))}
                      step="0.01"
                      min="0"
                      className="flex-1 bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Duration
                  </label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      placeholder="60"
                      value={newTemplate.duration}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      min="15"
                      max="1440"
                      step="15"
                      className="flex-1 bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-sm text-slate-400">min</span>
                  </div>
                </div>
              </div>

              {/* Run */}
              <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  Run
                </label>
                <select
                  value={newTemplate.run}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, run: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {Object.keys(RUN_STYLES).map(run => (
                    <option key={run} value={run}>{run}</option>
                  ))}
                </select>
              </div>

              {/* Required Ticket */}
              <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  Required Ticket
                </label>
                <div className="flex gap-1 flex-wrap">
                  {Object.values(TICKETS).map(ticket => (
                    <button
                      key={ticket.code}
                      onClick={() => setNewTemplate(prev => ({
                        ...prev,
                        requiredTicket: ticket.code,
                        ewpRequired: ticket.code === 'EWP'
                      }))}
                      className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                        newTemplate.requiredTicket === ticket.code
                          ? ticket.color
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      {ticket.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* EWP Required */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ewpRequired"
                  checked={newTemplate.ewpRequired}
                  onChange={(e) => setNewTemplate(prev => ({
                    ...prev,
                    ewpRequired: e.target.checked,
                    requiredTicket: e.target.checked ? 'EWP' : newTemplate.requiredTicket
                  }))}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
                />
                <label htmlFor="ewpRequired" className="text-xs text-slate-300">
                  Requires EWP
                </label>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  Priority
                </label>
                <div className="flex gap-1">
                  {['high', 'warning', 'normal', 'low'].map(priority => (
                    <button
                      key={priority}
                      onClick={() => setNewTemplate(prev => ({ ...prev, priority }))}
                      className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                        newTemplate.priority === priority
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      {priority.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Crew */}
              <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  Default Crew
                </label>
                <select
                  value={newTemplate.crewId}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, crewId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">None (select when scheduling)</option>
                  {crews.map(crew => (
                    <option key={crew.id} value={crew.id}>{crew.name}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  Notes
                </label>
                <textarea
                  value={newTemplate.notes}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Default notes for this template..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  <Tag className="h-3 w-3 inline mr-1" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-1 mb-1">
                  {newTemplate.tags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-rose-400 transition-colors"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add tag and press Enter or comma"
                  onKeyDown={handleTagInput}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Default Template */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newTemplate.isDefault}
                  onChange={(e) => setNewTemplate(prev => ({
                    ...prev,
                    isDefault: e.target.checked
                  }))}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
                />
                <label htmlFor="isDefault" className="text-xs text-slate-300">
                  Set as default template
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Template
                </button>
              </div>
            </div>
          )}

          {/* Manage Templates Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Template List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredTemplates.length === 0 ? (
                  <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
                    <p className="text-sm text-slate-400">No templates found</p>
                    <p className="text-xs text-slate-500">Create your first template</p>
                  </div>
                ) : (
                  filteredTemplates.map(template => {
                    const isSelected = selectedTemplate?.id === template.id;
                    return (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`p-3 rounded-lg border border-slate-800 cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-slate-800 ring-2 ring-teal-500' 
                            : 'bg-slate-900/50 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-white truncate">{template.name}</h4>
                              {template.isDefault && (
                                <span className="text-[10px] bg-teal-500 text-slate-950 px-1.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{template.site}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500">${template.cost}</span>
                              <span className="text-xs text-slate-500">{template.duration} min</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                template.priority === 'high' ? 'bg-rose-500/10 text-rose-400' :
                                template.priority === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {template.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Template Details */}
              {selectedTemplate && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                    Template Details
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Name</p>
                        <p className="text-sm text-slate-200">{selectedTemplate.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Site</p>
                        <p className="text-sm text-slate-200">{selectedTemplate.site}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Cost</p>
                        <p className="text-sm text-slate-200">${selectedTemplate.cost}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Duration</p>
                        <p className="text-sm text-slate-200">{selectedTemplate.duration} min</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Run</p>
                        <p className="text-sm text-slate-200">{selectedTemplate.run}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Ticket</p>
                        <p className="text-sm text-slate-200">{selectedTemplate.requiredTicket}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Notes</p>
                      <p className="text-sm text-slate-200">{selectedTemplate.notes || 'None'}</p>
                    </div>
                    
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemplate.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions for selected template */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setNewTemplate({ ...selectedTemplate, id: undefined });
                        setActiveTab('create');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewTemplate({ ...selectedTemplate });
                        setActiveTab('create');
                      }}
                      className="px-3 py-1.5 bg-teal-800 hover:bg-teal-750 text-teal-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteTemplate}
                      className="px-3 py-1.5 bg-rose-800 hover:bg-rose-750 text-rose-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobTemplateModal;
