const inputVideo = document.getElementById('inputVideo');
const pemutarVideo = document.getElementById('pemutarVideo');
const kanvasVideo = document.getElementById('kanvasVideo');
const ctx = kanvasVideo.getContext('2d');

const teksMulai = document.getElementById('teksMulai');
const teksSelesai = document.getElementById('teksSelesai');
const btnSetMulai = document.getElementById('btnSetMulai');
const btnSetSelesai = document.getElementById('btnSetSelesai');
const tombolPotong = document.getElementById('tombolPotong');

// Tombol Layout
const btnLay1 = document.getElementById('lay1');
const btnLay2 = document.getElementById('lay2');
const btnLay3 = document.getElementById('lay3');

let waktuMulai = 0;
let waktuSelesai = 0;
let layoutAktif = '1orang'; // Default

// Mengganti warna tombol layout yang aktif
function setAktif(tombol, mode) {
    btnLay1.classList.remove('aktif');
    btnLay2.classList.remove('aktif');
    btnLay3.classList.remove('aktif');
    tombol.classList.add('aktif');
    layoutAktif = mode;
}
btnLay1.onclick = () => setAktif(btnLay1, '1orang');
btnLay2.onclick = () => setAktif(btnLay2, '2orang');
btnLay3.onclick = () => setAktif(btnLay3, '3orang');

// Memasukkan Video
inputVideo.addEventListener('change', function(event) {
    const fileVideo = event.target.files[0];
    if (fileVideo) {
        pemutarVideo.src = URL.createObjectURL(fileVideo);
        pemutarVideo.load();
    }
});

// Penanda Waktu
btnSetMulai.onclick = () => { waktuMulai = pemutarVideo.currentTime; teksMulai.innerText = waktuMulai.toFixed(1); };
btnSetSelesai.onclick = () => { waktuSelesai = pemutarVideo.currentTime; teksSelesai.innerText = waktuSelesai.toFixed(1); };

// MESIN KANVAS: Menggambar video ke format 9:16 secara real-time
function gambarKeKanvas() {
    if (!pemutarVideo.paused && !pemutarVideo.ended) {
        const vw = pemutarVideo.videoWidth;
        const vh = pemutarVideo.videoHeight;
        const kw = kanvasVideo.width;   // 720
        const kh = kanvasVideo.height;  // 1280

        // Bersihkan kanvas (background hitam)
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, kw, kh);

        if (layoutAktif === '1orang') {
            // Ambil bagian tengah video
            const cropWidth = vh * (9/16);
            const startX = (vw - cropWidth) / 2;
            ctx.drawImage(pemutarVideo, startX, 0, cropWidth, vh, 0, 0, kw, kh);
            
        } else if (layoutAktif === '2orang') {
            // Podcast 2 Orang: Belah tengah. Kiri taruh atas, Kanan taruh bawah.
            ctx.drawImage(pemutarVideo, 0, 0, vw/2, vh, 0, 0, kw, kh/2); // Atas
            ctx.drawImage(pemutarVideo, vw/2, 0, vw/2, vh, 0, kh/2, kw, kh/2); // Bawah
            
            // Garis pembatas di tengah
            ctx.fillStyle = "white";
            ctx.fillRect(0, (kh/2) - 2, kw, 4);
            
        } else if (layoutAktif === '3orang') {
            // Podcast 3 Orang: Belah tiga bagian vertikal (Kiri, Tengah, Kanan)
            ctx.drawImage(pemutarVideo, 0, 0, vw/3, vh, 0, 0, kw, kh/3); // Atas
            ctx.drawImage(pemutarVideo, vw/3, 0, vw/3, vh, 0, kh/3, kw, kh/3); // Tengah
            ctx.drawImage(pemutarVideo, (vw/3)*2, 0, vw/3, vh, 0, (kh/3)*2, kw, kh/3); // Bawah
            
            // Garis pembatas
            ctx.fillStyle = "white";
            ctx.fillRect(0, (kh/3) - 2, kw, 4);
            ctx.fillRect(0, ((kh/3)*2) - 2, kw, 4);
        }
    }
    // Ulangi terus menerus seperti animasi
    requestAnimationFrame(gambarKeKanvas);
}

// Mulai menggambar saat video diputar
pemutarVideo.addEventListener('play', () => {
    gambarKeKanvas();
});

// PROSES EXPORT / POTONG
tombolPotong.addEventListener('click', function() {
    if (!pemutarVideo.src || waktuSelesai <= waktuMulai) return alert("Pilih video dan atur waktu yang benar!");

    tombolPotong.innerText = "⏳ Mengekspor Video Vertikal... Jangan ditutup!";
    tombolPotong.disabled = true;

    pemutarVideo.currentTime = waktuMulai;
    pemutarVideo.play();

    // 1. Ambil siaran gambar (Video) dari Kanvas (30 FPS)
    const streamGambar = kanvasVideo.captureStream(30);
    // 2. Ambil siaran Suara (Audio) dari Video Asli
    const streamAudioVideo = pemutarVideo.captureStream ? pemutarVideo.captureStream() : pemutarVideo.mozCaptureStream();
    
    // 3. Gabungkan Gambar Kanvas + Suara Asli
    const tracksGambar = streamGambar.getVideoTracks();
    const tracksSuara = streamAudioVideo.getAudioTracks();
    const streamGabungan = new MediaStream([...tracksGambar, ...tracksSuara]);

    const perekam = new MediaRecorder(streamGabungan);
    const hasilPotongan = [];

    perekam.ondataavailable = e => { if (e.data.size > 0) hasilPotongan.push(e.data); };
    
    perekam.onstop = () => {
        const fileHasil = new Blob(hasilPotongan, { type: 'video/mp4' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(fileHasil);
        link.download = `Clip_${layoutAktif}_${Math.floor(Math.random()*100)}.mp4`;
        link.click();

        tombolPotong.innerText = "✂️ EXPORT VIDEO VERTICAL!";
        tombolPotong.disabled = false;
    };

    perekam.start();

    const penjagaWaktu = setInterval(() => {
        if (pemutarVideo.currentTime >= waktuSelesai) {
            pemutarVideo.pause();
            perekam.stop();
            clearInterval(penjagaWaktu);
        }
    }, 100); 
});
