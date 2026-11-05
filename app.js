const inputVideo = document.getElementById('inputVideo');
const pemutarVideo = document.getElementById('pemutarVideo');
const kanvasVideo = document.getElementById('kanvasVideo');
const ctx = kanvasVideo.getContext('2d');

const teksMulai = document.getElementById('teksMulai');
const teksSelesai = document.getElementById('teksSelesai');
const btnSetMulai = document.getElementById('btnSetMulai');
const btnSetSelesai = document.getElementById('btnSetSelesai');
const tombolPotong = document.getElementById('tombolPotong');

const btnLay1 = document.getElementById('lay1');
const btnLay2 = document.getElementById('lay2');
const btnLay3 = document.getElementById('lay3');

// Mengambil elemen Hook yang baru kita buat
const inputHook = document.getElementById('inputHook');
const warnaTeks = document.getElementById('warnaTeks');

let waktuMulai = 0;
let waktuSelesai = 0;
let layoutAktif = '1orang'; 

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

inputVideo.addEventListener('change', function(event) {
    const fileVideo = event.target.files[0];
    if (fileVideo) {
        pemutarVideo.src = URL.createObjectURL(fileVideo);
        pemutarVideo.load();
    }
});

btnSetMulai.onclick = () => { waktuMulai = pemutarVideo.currentTime; teksMulai.innerText = waktuMulai.toFixed(1); };
btnSetSelesai.onclick = () => { waktuSelesai = pemutarVideo.currentTime; teksSelesai.innerText = waktuSelesai.toFixed(1); };

function gambarKeKanvas() {
    if (!pemutarVideo.paused && !pemutarVideo.ended) {
        const vw = pemutarVideo.videoWidth;
        const vh = pemutarVideo.videoHeight;
        const kw = kanvasVideo.width;   // 720
        const kh = kanvasVideo.height;  // 1280

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, kw, kh);

        if (layoutAktif === '1orang') {
            const cropWidth = vh * (9/16);
            const startX = (vw - cropWidth) / 2;
            ctx.drawImage(pemutarVideo, startX, 0, cropWidth, vh, 0, 0, kw, kh);
        } else if (layoutAktif === '2orang') {
            ctx.drawImage(pemutarVideo, 0, 0, vw/2, vh, 0, 0, kw, kh/2); 
            ctx.drawImage(pemutarVideo, vw/2, 0, vw/2, vh, 0, kh/2, kw, kh/2); 
            ctx.fillStyle = "white"; ctx.fillRect(0, (kh/2) - 2, kw, 4);
        } else if (layoutAktif === '3orang') {
            ctx.drawImage(pemutarVideo, 0, 0, vw/3, vh, 0, 0, kw, kh/3); 
            ctx.drawImage(pemutarVideo, vw/3, 0, vw/3, vh, 0, kh/3, kw, kh/3); 
            ctx.drawImage(pemutarVideo, (vw/3)*2, 0, vw/3, vh, 0, (kh/3)*2, kw, kh/3); 
            ctx.fillStyle = "white"; 
            ctx.fillRect(0, (kh/3) - 2, kw, 4);
            ctx.fillRect(0, ((kh/3)*2) - 2, kw, 4);
        }

        // FITUR BARU: Menggambar Teks Hook di Atas Video
        const teks = inputHook.value.trim(); // Ambil teks yang diketik
        if (teks !== "") {
            ctx.font = "bold 65px Arial"; // Ukuran font besar 65px
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            
            // Memberikan efek garis tepi (outline) warna hitam tebal 
            // agar teks selalu terbaca walaupun latar belakang videonya cerah
            ctx.lineJoin = "round";
            ctx.lineWidth = 12;
            ctx.strokeStyle = "black";
            ctx.strokeText(teks, kw / 2, 120); // Ditaruh di jarak 120px dari atas
            
            // Mewarnai bagian dalam teks sesuai pilihan warnamu
            ctx.fillStyle = warnaTeks.value; 
            ctx.fillText(teks, kw / 2, 120);
        }
    }
    requestAnimationFrame(gambarKeKanvas);
}

pemutarVideo.addEventListener('play', () => {
    gambarKeKanvas();
});

tombolPotong.addEventListener('click', function() {
    if (!pemutarVideo.src || waktuSelesai <= waktuMulai) return alert("Pilih video dan atur waktu yang benar!");

    tombolPotong.innerText = "⏳ Mengekspor... Jangan ditutup!";
    tombolPotong.disabled = true;

    pemutarVideo.currentTime = waktuMulai;
    pemutarVideo.play();

    const streamGambar = kanvasVideo.captureStream(30);
    const streamAudioVideo = pemutarVideo.captureStream ? pemutarVideo.captureStream() : pemutarVideo.mozCaptureStream();
    
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
        link.download = `Clipper_${Math.floor(Math.random()*100)}.mp4`;
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
    
