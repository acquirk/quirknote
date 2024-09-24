document.addEventListener('DOMContentLoaded', function() {
    const newNote = document.getElementById('new-note');
    const buckets = document.querySelectorAll('.bucket');
    const addBucket = document.getElementById('add-bucket');

    if (newNote) {
        newNote.value = '• '; // Initialize with bullet point and space
        let isTodo = false;
        
        newNote.addEventListener('focus', function() {
            if (this.value.trim() === '') {
                this.value = '• '; // Add bullet point and space
            }
        });

        newNote.addEventListener('input', function() {
            if (this.value.trim() === '') {
                this.value = isTodo ? '☐ ' : '• '; // Ensure there's always a bullet point or checkbox and space
            } else if (!this.value.startsWith('• ') && !this.value.startsWith('☐ ')) {
                this.value = (isTodo ? '☐ ' : '• ') + this.value.trimStart(); // Add bullet point or checkbox if it's not there
            }
        });

        newNote.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x < 20 && y < 20) { // Check if click is in the top-left corner
                isTodo = !isTodo;
                if (this.value.startsWith('• ')) {
                    this.value = '☐ ' + this.value.slice(2);
                } else if (this.value.startsWith('☐ ')) {
                    this.value = '• ' + this.value.slice(2);
                }
            }
        });

        newNote.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const content = this.value.trim();
                if (content && content !== '•' && content !== '☐') {
                    const bucketId = window.location.pathname.split('/').pop();
                    const isHomePage = window.location.pathname === '/';
                    // Remove bullet point/checkbox and any leading space before sending
                    const cleanContent = content.replace(/^[•☐]\s*/, '');
                    fetch('/add_note', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `content=${encodeURIComponent(cleanContent)}&is_todo=${isTodo}${isHomePage ? '' : `&bucket_id=${bucketId}`}`
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            if (isHomePage) {
                                this.value = isTodo ? '☐ ' : '• ';
                            } else {
                                location.reload();
                            }
                        }
                    });
                }
                this.value = isTodo ? '☐ ' : '• ';
                isTodo = false;
            }
        });
    }

    if (buckets) {
        buckets.forEach(bucket => {
            bucket.addEventListener('click', function() {
                const bucketId = this.getAttribute('data-id');
                window.location.href = `/bucket/${bucketId}`;
            });
        });
    }

    if (addBucket) {
        addBucket.addEventListener('click', function() {
            const bucketName = prompt('Enter new bucket name:');
            if (bucketName) {
                fetch('/add_bucket', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `name=${encodeURIComponent(bucketName)}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    }
                });
            }
        });
    }

    // Add event listener for todo checkboxes
    document.addEventListener('change', function(e) {
        if (e.target && e.target.classList.contains('todo-checkbox')) {
            const noteId = e.target.closest('.note').dataset.id;
            const completed = e.target.checked;

            fetch('/update_note_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `note_id=${noteId}&completed=${completed}`
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    // Revert the checkbox if the update failed
                    e.target.checked = !completed;
                }
            });
        }
    });
});
