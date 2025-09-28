// Todo App Client-Side JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeAlerts();
    initializeFormValidation();
    initializeTaskOperations();
    initializeLoadingStates();
    initializeAnimations();
});

// Auto-dismiss alerts after 5 seconds
function initializeAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        // Add fade-in animation
        alert.classList.add('fade-in');
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.classList.add('fade-out');
                setTimeout(() => {
                    alert.remove();
                }, 300);
            }
        }, 5000);
    });
}

// Form validation and enhancements
function initializeFormValidation() {
    // Password confirmation validation
    const signupForm = document.querySelector('form[action="/auth/signup"]');
    if (signupForm) {
        const password = signupForm.querySelector('#password');
        const confirmPassword = signupForm.querySelector('#confirmPassword');
        
        if (password && confirmPassword) {
            confirmPassword.addEventListener('input', function() {
                if (password.value !== confirmPassword.value) {
                    confirmPassword.setCustomValidity('Passwords do not match');
                    confirmPassword.classList.add('is-invalid');
                } else {
                    confirmPassword.setCustomValidity('');
                    confirmPassword.classList.remove('is-invalid');
                    confirmPassword.classList.add('is-valid');
                }
            });
        }
    }

    // Character counter for task forms
    const titleInput = document.querySelector('#title');
    const descriptionInput = document.querySelector('#description');
    
    if (titleInput) {
        addCharacterCounter(titleInput, 100);
    }
    
    if (descriptionInput) {
        addCharacterCounter(descriptionInput, 500);
    }

    // Form submission loading states
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                showLoadingState(submitButton);
            }
        });
    });
}

// Add character counter to input fields
function addCharacterCounter(input, maxLength) {
    const formText = input.nextElementSibling;
    if (formText && formText.classList.contains('form-text')) {
        const counter = document.createElement('span');
        counter.className = 'float-end text-muted';
        counter.textContent = `0/${maxLength}`;
        formText.appendChild(counter);

        input.addEventListener('input', function() {
            const currentLength = input.value.length;
            counter.textContent = `${currentLength}/${maxLength}`;
            
            if (currentLength > maxLength * 0.9) {
                counter.classList.add('text-warning');
                counter.classList.remove('text-muted');
            } else {
                counter.classList.add('text-muted');
                counter.classList.remove('text-warning');
            }
            
            if (currentLength >= maxLength) {
                counter.classList.add('text-danger');
                counter.classList.remove('text-warning', 'text-muted');
            }
        });
    }
}

// Task operation confirmations and enhancements
function initializeTaskOperations() {
    // Delete confirmations
    const deleteButtons = document.querySelectorAll('button[title="Delete task"], .btn-danger');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
                e.preventDefault();
                return false;
            }
        });
    });

    // Task completion animations
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Status update confirmations
    const statusButtons = document.querySelectorAll('button[title="Mark as completed"], button[title="Mark as pending"]');
    statusButtons.forEach(button => {
        button.addEventListener('click', function() {
            showLoadingState(this);
        });
    });
}

// Loading states for buttons and forms
function initializeLoadingStates() {
    // Add loading spinner CSS if not exists
    if (!document.querySelector('#loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            .loading-spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid #ffffff;
                border-radius: 50%;
                border-top-color: transparent;
                animation: spin 0.8s linear infinite;
                margin-right: 8px;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            .fade-out {
                opacity: 0;
                transition: opacity 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
}

// Show loading state on buttons
function showLoadingState(button) {
    if (button.querySelector('.loading-spinner')) return;
    
    const spinner = document.createElement('span');
    spinner.className = 'loading-spinner';
    
    const originalText = button.innerHTML;
    button.innerHTML = '';
    button.appendChild(spinner);
    button.appendChild(document.createTextNode('Processing...'));
    button.disabled = true;
    
    // Restore button after 5 seconds (fallback)
    setTimeout(() => {
        if (button.disabled) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }, 5000);
}

// Initialize animations and transitions
function initializeAnimations() {
    // Animate elements when they come into view
    const animateElements = document.querySelectorAll('.task-card, .stats-card, .alert');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    animateElements.forEach(element => {
        observer.observe(element);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <i class="fas fa-info-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.classList.add('fade-out');
                setTimeout(() => alertDiv.remove(), 300);
            }
        }, 3000);
    }
}

// Handle online/offline status
window.addEventListener('online', function() {
    showNotification('Connection restored!', 'success');
});

window.addEventListener('offline', function() {
    showNotification('You are currently offline. Some features may not work.', 'warning');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search (if exists)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Escape to close modals or clear focus
    if (e.key === 'Escape') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.blur) {
            activeElement.blur();
        }
    }
});

// Performance optimization: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error handling for AJAX requests (if needed in future)
function handleAjaxError(error) {
    console.error('Ajax error:', error);
    showNotification('An error occurred. Please try again.', 'danger');
}

// Initialize tooltips (Bootstrap)
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Export functions for potential future use
window.TodoApp = {
    showNotification,
    showLoadingState,
    debounce,
    handleAjaxError
};