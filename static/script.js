document.addEventListener('DOMContentLoaded', function() {
    const newNote = document.getElementById('new-note');
    const buckets = document.querySelectorAll('.bucket');
    const addBucket = document.getElementById('add-bucket');

    if (newNote) {
        newNote.value = ''; // Clear any initial value
        
        newNote.addEventListener('focus', function() {
            if (this.value === '') {
                this.value = ' '; // Add a space to keep the bullet visible
            }
        });

        newNote.addEventListener('input', function() {
            if (this.value === '') {
                this.value = ' '; // Ensure there's always at least a space
            }
        });

        newNote.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const content = this.value.trim();
                if (content) {
                    const bucketId = window.location.pathname.split('/').pop();
                    const isHomePage = window.location.pathname === '/';
                    // Remove any leading space before sending
                    const cleanContent = content.replace(/^\s+/, '');
                    fetch('/add_note', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `content=${encodeURIComponent(cleanContent)}${isHomePage ? '' : `&bucket_id=${bucketId}`}`
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            if (isHomePage) {
                                this.value = ' ';
                            } else {
                                location.reload();
                            }
                        }
                    });
                }
                this.value = ' ';
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
});
