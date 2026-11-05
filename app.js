// 1. Mengambil semua elemen dari wajah aplikasi (HTML)
const inputVideo = document.getElementById('inputVideo');
const pemutarVideo = document.getElementById('pemutarVideo');
const teksMulai = document.getElementById('teksMulai');
const teksSelesai = document.getElementById('teksSelesai');
const btnSetMulai = document.getElementById('btnSetMulai');
const btnSetSelesai = document.getElementById('btnSetSelesai');
const tombolPotong = document.getElementById('tombolPotong');

// Menyimpan memori waktu
let waktuMulai = 0;
let waktuSelesai = 0;

// 2. Memasukkan video ke layar seperti sebelumnya
inputVideo.addEventListener('change', function(event) {
    const fileVideo = event.target.files[0];
    if (fileVideo) {
        const urlVideo = URL.createObjectURL(fileVideo);
        pemutarVideo.src = urlVideo;
        pemutarVideo.load();
    }
});

// 3. Menandai waktu saat tombol "Mulai" ditekan
btnSetMulai.addEventListener('click', function() {
    waktuMulai = pemutarVideo.currentTime; // Ambil detik saat ini
    teksMulai.innerText = waktuMulai.toFixed(2); // Tampilkan di layar
});

// 4. Menandai waktu saat tombol "Selesai" ditekan
btnSetSelesai.addEventListener('click', function() {
    waktuSelesai = pemutarVideo.currentTime; // Ambil detik saat ini
    teksSelesai.innerText = waktuSelesai.toFixed(2); // Tampilkan di layar
});

// 5. Mesin Pintar: Memotong Video saat ditekan
tombolPotong.addEventListener('click', function() {
    if (!pemutarVideo.src) {
        alert("Masukkan video dulu dari galeri!");
        return;
    }
    if (waktuSelesai <= waktuMulai) {
        alert("Waktu Selesai harus lebih besar dari Waktu Mulai!");
        return;
    }

    // Ubah tampilan tombol
    tombolPotong.innerText = "⏳ Sedang Memotong... Biarkan Video Menyala";
    tombolPotong.disabled = true; // Kunci tombol agar tidak ditekan 2x

    // Mundurkan video ke waktu mulai, lalu putar
    pemutarVideo.currentTime = waktuMulai;
    pemutarVideo.play();

    // Fitur rahasia browser untuk menangkap siaran video
    const stream = pemutarVideo.captureStream ? pemutarVideo.captureStream() : pemutarVideo.mozCaptureStream();
    
    // Siapkan alat perekam
    const perekam = new MediaRecorder(stream);
    const hasilPotongan = [];

    // Kumpulkan potongan-potongan video
    perekam.ondataavailable = function(event) {
        if (event.data.size > 0) hasilPotongan.push(event.data);
    };

    // Apa yang terjadi setelah selesai merekam?
    perekam.onstop = function() {
        // Satukan potongan jadi file video utuh (mp4)
        const fileHasil = new Blob(hasilPotongan, { type: 'video/mp4' });
        const urlDownload = URL.createObjectURL(fileHasil);
        
        // Perintah rahasia agar HP otomatis mendownload video
        const link = document.createElement('a');
        link.href = urlDownload;
        link.download = "Hasil_Potong_Video.mp4";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Kembalikan tombol seperti semula
        tombolPotong.innerText = "✅ BERHASIL! (Cek Notifikasi Download HP)";
        setTimeout(() => {
            tombolPotong.innerText = "✂️ POTONG VIDEO!";
            tombolPotong.disabled = false;
        }, 4000);
    };

    perekam.start(); // Mulai merekam

    // Mesin mengecek setiap milidetik, kalau sudah sampai "Waktu Selesai", STOP!
    const penjagaWaktu = setInterval(function() {
        if (pemutarVideo.currentTime >= waktuSelesai) {
            pemutarVideo.pause(); // Hentikan video
            perekam.stop();       // Hentikan perekam
            clearInterval(penjagaWaktu); // Istirahatkan penjaga waktu
        }
    }, 100); 
});
    
