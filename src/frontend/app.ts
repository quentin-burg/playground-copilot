/**
 * Application frontend pour Task Manager
 *
 * @module frontend
 */

// Force ce fichier à être traité comme un module pour permettre declare global
export {};

const API_BASE_URL = '/api/v1';

/**
 * Interface pour une tâche
 */
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  createdAt: string;
  updatedAt: string;
}

/**
 * Extension de l'interface Window pour les fonctions globales
 */
declare global {
  interface Window {
    updateTaskStatus: (id: string, currentStatus: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
  }
}

/**
 * Affiche un message temporaire
 */
function showMessage(message: string, type: 'success' | 'error'): void {
  const messageEl = document.getElementById('message');
  if (!messageEl) return;

  messageEl.className = type;
  messageEl.textContent = message;
  messageEl.style.display = 'block';

  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 3000);
}

/**
 * Récupère toutes les tâches depuis l'API
 */
async function fetchTasks(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const data = await response.json() as { data: Task[] };
    renderTasks(data.data);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    showMessage('Erreur lors du chargement des tâches', 'error');
  }
}

/**
 * Affiche les tâches dans le DOM
 */
function renderTasks(tasks: Task[]): void {
  const container = document.getElementById('tasks-container');
  if (!container) return;

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <p>Aucune tâche pour le moment</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem">
          Créez votre première tâche ci-dessus !
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = tasks
    .map((task) => {
      const statusLabels = {
        todo: 'À faire',
        in_progress: 'En cours',
        done: 'Terminé',
      };

      return `
        <div class="task-card status-${task.status}">
          <div class="task-header">
            <div class="task-title">${escapeHtml(task.title)}</div>
          </div>
          ${
            (task.description !== undefined && task.description !== '')
              ? `<div class="task-description">${escapeHtml(task.description)}</div>`
              : ''
          }
          <div class="task-meta">
            <span class="task-status ${task.status}">
              ${statusLabels[task.status]}
            </span>
            <div class="task-actions">
              <button class="btn btn-small" onclick="updateTaskStatus('${task.id}', '${
        task.status
      }')">
                Changer statut
              </button>
              <button class="btn btn-small btn-delete" onclick="deleteTask('${task.id}')">
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * Échappe le HTML pour éviter les injections XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Crée une nouvelle tâche
 */
async function createTask(event: Event): Promise<void> {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  const task = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || undefined,
    status: formData.get('status') as 'todo' | 'in_progress' | 'done',
  };

  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const error = await response.json() as { error?: string };
      const errorMessage = (error.error !== undefined && error.error !== '') ? error.error : 'Failed to create task';
      throw new Error(errorMessage);
    }

    showMessage('Tâche créée avec succès !', 'success');
    form.reset();
    await fetchTasks();
  } catch (err) {
    console.error('Error creating task:', err);
    showMessage(
      err instanceof Error ? err.message : 'Erreur lors de la création',
      'error'
    );
  }
}

/**
 * Change le statut d'une tâche
 */
async function updateTaskStatus(taskId: string, currentStatus: string): Promise<void> {
  const statuses = ['todo', 'in_progress', 'done'];
  const currentIndex = statuses.indexOf(currentStatus);
  const nextStatus = statuses[(currentIndex + 1) % statuses.length];

  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    showMessage('Statut mis à jour !', 'success');
    await fetchTasks();
  } catch (err) {
    console.error('Error updating task:', err);
    showMessage('Erreur lors de la mise à jour', 'error');
  }
}

/**
 * Supprime une tâche
 */
async function deleteTask(taskId: string): Promise<void> {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to delete task');
    }

    showMessage('Tâche supprimée !', 'success');
    await fetchTasks();
  } catch (err) {
    console.error('Error deleting task:', err);
    showMessage('Erreur lors de la suppression', 'error');
  }
}

// Exposer les fonctions globalement pour les onclick
window.updateTaskStatus = updateTaskStatus;
window.deleteTask = deleteTask;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  if (form) {
    form.addEventListener('submit', (event: Event) => {
      void createTask(event);
    });
  }

  // Charger les tâches initiales
  void fetchTasks();
});
