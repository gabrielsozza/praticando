document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    const images = document.querySelectorAll('.carousel-container img');
    let currentIndex = 0;

    // Função para mover as imagens
    function moveCarousel() {
        currentIndex++;
        if (currentIndex >= images.length) {
            currentIndex = 0;
        }
        const offset = -currentIndex * 100; // Move 100% para a esquerda
        carouselContainer.style.transform = `translateX(${offset}%)`;
    }

    // Mover o carrossel automaticamente a cada 3 segundos
    setInterval(moveCarousel, 3000); // 3000ms = 3 segundos
});


