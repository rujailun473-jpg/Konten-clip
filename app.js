// Mengambil bagian-bagian dari wajah aplikasi (HTML)
const inputVideo = document.getElementById('inputVideo');
const pemutarVideo = document.getElementById('pemutarVideo');
const tombolInfo = document.getElementById('tombolInfo');

// Perintah 1: Apa yang terjadi saat kamu memilih video dari galeri HP
inputVideo.addEventListener('change', function(event) {
    const fileVideo = event.target.files[0]; // Mengambil file video pertama yang dipilih
    
    if (fileVideo) {
        // Membuat jalur khusus agar HP bisa memutar video tersebut di browser
        const urlVideo = URL.createObjectURL(fileVideo);
        pemutarVideo.src = urlVideo; // Memasukkan video ke layar hitam
        pemutarVideo.load();         // Memuat video agar siap diputar
    }
});

// Perintah 2: Apa yang terjadi saat tombol "Cek Status" ditekan
tombolInfo.addEventListener('click', function() {
    if (pemutarVideo.src) {
        alert("Video berhasil masuk! Nanti mesin pemotong videonya kita pasang di sini.");
    } else {
        alert("Pilih video dulu dari galeri HP kamu ya!");
    }
});
          
