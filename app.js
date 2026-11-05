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
const inputHook = document.getElementById('inputHook');
const warnaTeks = document.getElementById('warnaTeks');
const geserX = document.getElementById('geserX');
const areaGeserKamera = document.getElementById('areaGeserKamera');

// Komponen AI Baru
const inputTopik = document.getElementById('inputTopik');
const teksPrompt = document.getElementById('teksPrompt');
const btnSalinAI = document.getElementById('btnSalinAI');

let waktuMulai = 0;
let waktuSelesai = 0;
let layoutAktif = '1orang'; 

function setAktif(tombol, mode) {
    btnLay1.classList.remove('aktif');
    btnLay2.classList.remove('aktif');
    btnLay3.classList.remove('aktif');
    tombol.classList.add('aktif');
    layoutAktif = mode;
    
    if (mode === '1orang') {
        areaGeserKamera.style.display = 'block';
    } else {
        areaGeserKamera.style.display = 'none';
    }
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

// Logika Generator Prompt AI
btnSalinAI.addEventListener('click', function() {
    const topik = inputTopik.value.trim();
    if (topik === "") {
        alert("Isi dulu topik videonya, ya!");
        return;
    }

    // Meracik formula prompt rahasia
    const formulaPrompt = `Saya sedang mengedit video klip podcast pendek format 9:16 untuk TikTok dan YouTube Shorts. Topik pembahasannya adalah: "${topik}".

Tolong buatkan saya:
1. 3 pilihan judul tulisan (Hook) maksimal 4-5 kata. Harus sangat provokatif, mengundang klik, dan bikin penasaran di 3 detik pertama.
2. Caption singkat untuk deskripsi video yang engaging, dilanjutkan dengan Call to Action (CTA) agar penonton follow/komen.
3. 5 hashtag yang paling relevan dan viral.`;

    // Tampilkan di layar agar bisa dibaca
    teksPrompt.innerText = formulaPrompt;
    teksPrompt.style.display = "block";

    // Menyalin ke papan klip (clipboard) HP
    navigator.clipboard.writeText(formulaPrompt).then(() => {
        btnSalinAI.innerText = "✅ Tersalin! Buka AI...";
        
        // Membuka tab baru ke Google Gemini atau ChatGPT setelah 1.5 detik
        setTimeout(() => {
            window.open('https://gemini.google.com/', '_blank');
            btnSalinAI.innerText = "✨ Racik & Salin Prompt untuk AI";
            teksPrompt.style.display = "none";
            inputTopik.value = ""; // Kosongkan input
        }, 1500);
    });
});

function gambarKeKanvas() {
    if (!pemutarVideo.paused && !pemutarVideo.ended) {
        const vw = pemutarVideo.videoWidth;
        const vh = pemutarVideo.videoHeight;
        const kw = kanvasVideo.width;   
        const kh = kanvasVideo.height;  

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, kw, kh);

        if (layoutAktif === '1orang') {
            const cropWidth = vh * (9/16); 
            const maxGeser = vw - cropWidth; 
            let startX = maxGeser * (geserX.value / 100); 
            if (startX < 0) startX = 0;
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

        const teks = inputHook.value.trim(); 
        if (teks !== "") {
            ctx.font = "bold 65px Arial"; 
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.lineJoin = "round";
            ctx.lineWidth = 12;
            ctx.strokeStyle = "black";
            ctx.strokeText(teks, kw / 2, 120); 
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
        
