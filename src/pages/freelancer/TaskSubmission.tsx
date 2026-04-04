
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, FileText, Code, CheckCircle, Trash2 } from 'lucide-react';
import { taskService } from '../../services/taskService';
import type { Task } from '../../services/taskService';
import AgentDrawer from '../../components/AgentDrawer';

type SubmissionField = {
  id: string;
  type: 'text' | 'code';
  label: string;
  content: string;
};

const TaskSubmission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fields, setFields] = useState<SubmissionField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);

  useEffect(() => {
    const loadTask = async () => {
      if (!id) return;
      try {
        const taskData = await taskService.getTaskById(id);
        setTask(taskData);
      } catch (error) {
        console.error('Error loading task:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTask();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Task Not Found</h2>
          <Link to="/freelancer/your-tasks" className="text-muted-foreground hover:text-foreground">
            Return to Your Tasks
          </Link>
        </div>
      </div>
    );
  }

  const addField = (type: 'text' | 'code') => {
    const newField: SubmissionField = {
      id: Date.now().toString(),
      type,
      label: '',
      content: ''
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateFieldLabel = (id: string, label: string) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, label } : field
    ));
  };

  const updateFieldContent = (id: string, content: string) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, content } : field
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (fields.length === 0) {
      alert('Please add at least one submission field');
      return;
    }

    if (fields.some(f => !f.label.trim() || !f.content.trim())) {
      alert('Please fill in all field labels and content');
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        fields: fields.map(f => ({
          type: f.type,
          label: f.label,
          content: f.content
        })),
        submitted_at: new Date().toISOString()
      };

      await taskService.submitWork(task!.id, submissionData);
      
      const baseUrl = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/verify-submission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_description: task!.description,
          task_requirements: task!.requirements,
          submission_data: submissionData
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInteractionId(data.interaction_id);
        setIsDrawerOpen(true);
        
        const walletAddress = localStorage.getItem('walletAddress');
        localStorage.setItem('currentVerification', JSON.stringify({
          taskId: task!.id,
          wallet: walletAddress
        }));
      } else {
        alert('Failed to start verification. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting work:', error);
      alert('Failed to submit work. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: SubmissionField) => {
    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="bg-secondary/30 border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-foreground" />
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                  placeholder="Field Label"
                  className="bg-background border border-border rounded px-3 py-1.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <button
                type="button"
                onClick={() => removeField(field.id)}
                className="text-destructive hover:text-destructive/80 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={field.content}
              onChange={(e) => updateFieldContent(field.id, e.target.value)}
              placeholder="Enter your text content here..."
              rows={6}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground resize-none"
            />
          </div>
        );

      case 'code':
        return (
          <div key={field.id} className="bg-secondary/30 border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-foreground" />
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                  placeholder="Field Label"
                  className="bg-background border border-border rounded px-3 py-1.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <button
                type="button"
                onClick={() => removeField(field.id)}
                className="text-destructive hover:text-destructive/80 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={field.content}
              onChange={(e) => updateFieldContent(field.id, e.target.value)}
              placeholder="Paste your code here..."
              rows={12}
              className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground resize-none font-mono text-sm leading-relaxed"
            />
          </div>
        );
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-16 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-secondary/50 border border-green-500/50 rounded-xl p-12 max-w-lg shadow-sm">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-3">Submission Received!</h2>
            <p className="text-muted-foreground mb-4">
              Your work has been submitted successfully. The AI agent will now verify your submission.
            </p>
            <p className="text-sm text-muted-foreground opacity-70">
              Redirecting to your tasks...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link to="/freelancer/your-tasks">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Your Tasks</span>
          </motion.button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Submit Your Work</h1>
          <p className="text-xl text-muted-foreground">{task.title}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Submission Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {renderField(field)}
              </motion.div>
            ))}
          </motion.div>

          {/* Add Field Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-secondary/30 border border-border rounded-xl p-6 shadow-sm"
          >
            <p className="text-sm font-semibold text-foreground mb-3">Add Submission Field:</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => addField('text')}
                className="flex items-center space-x-2 bg-secondary/50 hover:bg-secondary text-foreground px-4 py-2 rounded-lg transition-colors border border-border"
              >
                <Plus className="w-4 h-4" />
                <FileText className="w-4 h-4" />
                <span>Text Field</span>
              </button>
              <button
                type="button"
                onClick={() => addField('code')}
                className="flex items-center space-x-2 bg-secondary/50 hover:bg-secondary text-foreground px-4 py-2 rounded-lg transition-colors border border-border"
              >
                <Plus className="w-4 h-4" />
                <Code className="w-4 h-4" />
                <span>Code Field</span>
              </button>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t border-border"
          >
            <Link to="/freelancer/your-tasks">
              <button
                type="button"
                className="px-6 py-3 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </Link>
            <motion.button
              type="submit"
              disabled={isSubmitting || fields.length === 0}
              whileHover={{ scale: (isSubmitting || fields.length === 0) ? 1 : 1.02 }}
              whileTap={{ scale: (isSubmitting || fields.length === 0) ? 1 : 0.98 }}
              className="bg-foreground text-background px-8 py-3 rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit Work</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>

      {isDrawerOpen && interactionId && (
        <AgentDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          interactionId={interactionId}
          taskId={task?.id}
          isVerification={true}
        />
      )}
    </div>
  );
};

export default TaskSubmission;

