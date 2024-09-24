document.addEventListener('DOMContentLoaded', function() {
    const newNote = document.getElementById('new-note');
    const buckets = document.querySelectorAll('.bucket');
    const addBucket = document.getElementById('add-bucket');

    if (newNote) {
        newNote.value = ' '; // Initialize with just a space
        
        newNote.addEventListener('focus', function() {
            if (this.value.trim() === '') {
                this.value = ' '; // Add a space
            }
        });

        newNote.addEventListener('input', function() {
            if (this.value.trim() === '') {
                this.value = ' '; // Ensure there's always a space
            } else if (this.value[0] !== ' ') {
                this.value = ' ' + this.value; // Add space if it's not there
            }
        });

        newNote.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const content = this.value.trim();
                if (content && content !== '•') {
                    const bucketId = window.location.pathname.split('/').pop();
                    const isHomePage = window.location.pathname === '/';
                    // Remove bullet point and any leading space before sending
                    const cleanContent = content.replace(/^•\s*/, '');
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
