document.addEventListener('DOMContentLoaded', function() {
    const newNote = document.getElementById('new-note');
    const buckets = document.querySelectorAll('.bucket');
    const addBucket = document.getElementById('add-bucket');

    newNote.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Here you would typically send the note to the server
            console.log('New note:', this.value);
            this.value = '• ';
        }
    });

    buckets.forEach(bucket => {
        bucket.addEventListener('click', function() {
            const bucketId = this.getAttribute('data-id');
            window.location.href = `/bucket/${bucketId}`;
        });
    });

    addBucket.addEventListener('click', function() {
        const bucketName = prompt('Enter new bucket name:');
        if (bucketName) {
            // Here you would typically send the new bucket to the server
            console.log('New bucket:', bucketName);
        }
    });
});
