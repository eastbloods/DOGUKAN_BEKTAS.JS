(() => {
    let products = [];
    let favorites = JSON.parse(localStorage.getItem('might_carousel_favorites')) || [];
    let isDragging = false;
    let startPosition = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let startTime = 0;
    let currentIndex = 0;

    const init = async () => {
        if (!isProductPage()) return;
        await loadProducts();
        buildHTML();
        buildCSS();
        renderProducts();
        setEvents();
    };

    const isProductPage = () => {
        return document.querySelector('.product-detail') !== null;
    };

    const loadProducts = async () => {
        const storedProducts = localStorage.getItem('might_carousel_products');
        if (storedProducts) {
            products = JSON.parse(storedProducts);
            console.log("Ürünler localStorage a getirildi");
            return;
        }
        try {
            const response = await fetch('https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json');
            products = await response.json();
            localStorage.setItem('might_carousel_products', JSON.stringify(products));
            console.log('Ürünler Apiden alındı ve localStorage a kaydedildi');
        } catch (error) {
            console.error('Ürünleri çekerken hata:', error);
            products = [];
        }
    };

    const saveFavorites = () => {
        localStorage.setItem('might_carousel_favorites', JSON.stringify(favorites));
        console.log('Favoriler kaydedildi:', favorites);
    };

    const buildHTML = () => {
        const html = `
            <div class="item-might-like-outer">
                <div class="item-might-like-inner">
                    <div class="might-like-carousel">
                        <div class="might-like-container">
                            <p class="might-products-title">You Might Also Like</p>
                            <div class="might-carousel-padded">
                                <button class="might-carousel-arrow might-arrow-left">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14.242" height="24.242" viewBox="0 0 14.242 24.242"><path fill="none" stroke="#333" stroke-linecap="round" stroke-width="3px" d="M2106.842 2395.467l-10 10 10 10" transform="translate(-2094.721 -2393.346)"></path></svg>
                                </button>
                                <div class="might-carousel-slider">
                                    <div class="might-carousel-slider-wrapper">
                                        <div class="might-carousel-slider-tray"></div>
                                    </div>
                                </div>
                                <button class="might-carousel-arrow might-arrow-right svg-rotate-180">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14.242" height="24.242" viewBox="0 0 14.242 24.242"><path fill="none" stroke="#333" stroke-linecap="round" stroke-width="3px" d="M2106.842 2395.467l-10 10 10 10" transform="translate(-2094.721 -2393.346)"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.product-detail').insertAdjacentHTML('afterend', html);
    };

    const buildCSS = () => {

        const css = `
            .item-might-like-outer{
                background-color: #f4f5f7;
            }
            
            .item-might-like-inner {
                width: 80%;
                margin-left: auto;
                margin-right: auto;
            }
            
            .might-like-carousel {
                
            }
            
            .might-like-container {
                position: relative;
                display: flex;
                align-items: center;
                flex-wrap:wrap;
            }
            
            .might-products-title {
                font-size: 32px;
                font-weight: lighter;
                line-height: 43px;
                padding: 15px 0 15px 10px;
                text-align: left;
                color: #29323b;
            }
            
            .might-carousel-padded {
                width: 100%;
                overflow: hidden;
            }
            
            .might-carousel-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 40px;
                height: 40px;
                background: none;
                border: none;
                cursor: pointer;
                z-index: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .might-arrow-left {
                left: -35px;
            }
            
            .might-carousel-slider {
                position: relative;
                width: 100%;
                overflow: hidden;
                margin-left: 5px;
            }
            
            .might-carousel-slider-wrapper {
                width: 100%;
                overflow: hidden;
            }
            
            .might-carousel-slider-tray {
                display: flex;
                align-items: stretch;
                transition: transform 0.5s;
                transition-timing-function: cubic-bezier(.645,.045,.355,1);
                will-change: transform;
                padding-bottom: 24px;
                cursor: grab;
            }
            
            .might-carousel-slider-tray.dragging {
                cursor: grabbing;
                transition: none;
            }
            
            .might-carousel-inner-slide {
                flex: 0 0 auto;
                margin: 0 10px;
                position: relative;
                width: 210px;
                height: 380px;
                background-color: #fff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
            }
            
            .might-product-card {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
            }
            
            .might-product-image {
                width: 210px;
                height: 280px;
                background-color: transparent;
                object-fit: cover;
                aspect-ratio: 1/1;
            }
            
            .might-product-card-like-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background: white;
                border-radius: 5px;
                width: 34px;
                height: 34px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border: 0.5px solid #b6b7b9;
                box-shadow: 0 3px 6px 0 rgba(0,0,0,.16);
            }
            
            .might-product-card-like-button svg {
                width: 18px;
                height: 18px;
                fill: transparent;
                stroke: #999;
                stroke-width: 2;
                transition: all 0.2s;
            }
            
            .might-product-card-like-button.active svg {
                fill: #193db0;
                stroke: #193db0;
            }
            
            .might-product-card-information-box {
                width: 100%;
                height: 95px;
                background-color: #fff;
                padding: 0 10px;
                box-sizing: border-box;
                flex-direction: column;
            }
            
            .might-product-name {
                font-size: 14px;
                line-height: 1.3;
                margin: 0;
                color: #302e2b;
                text-align: left;
                user-select: none;
                user-drag: none;
            }
            
            .might-price-current {
                font-size: 18px;
                font-weight: bold;
                color: #193db0;
                text-align: left;
                line-height: 22px;
                user-select: none;
                cursor: default;
                display: flex;
                align-items: flex-start;
                height: 50px;
                flex-direction: column;
            }
            
            .might-arrow-right {
                right: -35px;
            }
            .svg-rotate-180 svg {
                transform: rotate(180deg);
            }
            
            .might-product-card-information-title a {
                text-decoration: none;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                
            }
            
            .might-product-add-to-cart {
                display: none;
            }
            
            
            
            @media screen and (max-width: 768px) {
                 .might-product-add-to-cart {
                    display: flex;
                    gap: 5px;
                }
            
                .might-add-to-cart {
                    height: 35px;
                    display: block;
                    background-color: #193db0;
                    color: #fff;
                    width: 100%;
                    border-radius: 5px;
                    border: none;
                    line-height: 19px;
                    font-size: 14px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                
                .might-carousel-arrow {
                    display: none;
                }
                .might-carousel-slider-tray {
                    width: 625%;
                }
                
                .item-might-like-inner {
                    width: 100%;
                    margin-left: 0;
                    margin-right: 0;
                }
                
                .might-carousel-inner-slide {
                    width: 28rem;
                    height: 51rem;
                }
                
                .might-product-image {
                    width: 100%;
                    height: 373.33px;
                }
                
                .might-product-card-information-box {
                    height: 100%;
                    display: flex;
                }
                
                .might-product-card-information-title {
                    height: 40px
                }
                
                .might-products-title {
                    font-size: 24px;
                }                
            }
        `;
        const styleElement = document.createElement('style');
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
    };

    const renderProducts = () => {
        const mightCarouselSlideTray = document.querySelector('.might-carousel-slider-tray');
        products.forEach(product => {
            const isFavorite = favorites.includes(product.id);
            const productHTML = `
                <div class="might-carousel-slide" data-id="${product.id}">
                    <div class="might-carousel-inner-slide">
                        <div class="might-product-card">
                            <div class="might-product-card-image-wrapper">
                                <a href="${product.url}" target="_blank">
                                    <img src="${product.img}" alt="${product.name}" class="might-product-image">
                                </a>
                                <div class="might-product-card-like-button ${isFavorite ? 'active' : ''}" data-id="${product.id}">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="might-product-card-information-box">
                                <div class="might-product-card-information-title">
                                    <a href="${product.url}" target="_blank">
                                        <p class="might-product-name">${product.name}</p>
                                    </a>
                                </div>
                                <div class="might-product-card-information-price">
                                    <div class="might-price-current">${product.price} TL</div>
                                </div>
                                <div class="might-product-add-to-cart">
                                       <button class="might-add-to-cart">Sepete Ekle</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                    
            `;
            mightCarouselSlideTray.insertAdjacentHTML('beforeend', productHTML);
        });
    };

    const setEvents = () => {
        document.querySelectorAll('.might-product-card-like-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = button.getAttribute('data-id');
                const favoriteIndex = favorites.indexOf(Number(productId));
                if (favoriteIndex === -1) {
                    favorites.push(Number(productId));
                    button.classList.add('active');
                } else {
                    favorites.splice(favoriteIndex, 1);
                    button.classList.remove('active');
                }
                saveFavorites();
            });
        });

        const carouselTrack = document.querySelector('.might-carousel-slider-tray');
        const items = document.querySelectorAll('.might-carousel-slide');
        if (items.length === 0) return;

        let itemWidth = items[0].offsetWidth;
        let position = 0;
        let maxPosition = Math.max(0, (items.length - 1) * itemWidth);

        const setPosition = (index) => {
            currentIndex = index;
            position = index * itemWidth;
            carouselTrack.style.transform = `translateX(-${position}px)`;
            prevTranslate = -position;
            currentTranslate = prevTranslate;
        };

        window.addEventListener('resize', () => {
            itemWidth = items[0].offsetWidth;
            maxPosition = Math.max(0, (items.length - 1) * itemWidth);
            setPosition(currentIndex);
        });

        //Sol Ok
        document.querySelector('.might-arrow-left').addEventListener('click', () => {
            if (currentIndex > 0) {
                setPosition(currentIndex - 1);
            }
        });
        //SSağ ok
        document.querySelector('.might-arrow-right').addEventListener('click', () => {
            if (currentIndex < items.length - 1) {
                setPosition(currentIndex + 1);
            }
        });

        function dragStart(e) {
            if (e.type === 'touchstart') {
                startPosition = e.touches[0].clientX;
            } else {
                startPosition = e.clientX;
                e.preventDefault();
            }

            startTime = new Date().getTime();
            isDragging = true;
            carouselTrack.classList.add('dragging');

            cancelAnimationFrame(animationID);
        }

        function dragMove(e) {
            if (!isDragging) return;

            let currentPosition;
            if (e.type === 'touchmove') {
                currentPosition = e.touches[0].clientX;
            } else {
                currentPosition = e.clientX;
            }

            const diff = currentPosition - startPosition;
            currentTranslate = prevTranslate + diff;

            if (currentTranslate > 0) {
                currentTranslate = 0;
            } else if (currentTranslate < -maxPosition) {
                currentTranslate = -maxPosition;
            }

            carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
        }

        function dragEnd(e) {
            if (!isDragging) return;

            isDragging = false;
            const endTime = new Date().getTime();
            const timeElapsed = endTime - startTime;
            carouselTrack.classList.remove('dragging');

            const movedDistance = prevTranslate - currentTranslate;
            const quickSwipeRatio = 0.3 * itemWidth;
            const dragDistanceRatio = 0.5 * itemWidth;

            const isQuickSwipe = timeElapsed < 300 && Math.abs(movedDistance) > 5;

            let targetIndex = currentIndex;

            if (isQuickSwipe && Math.abs(movedDistance) > quickSwipeRatio) {
                if (movedDistance > 0) {
                    targetIndex = Math.min(items.length - 1, currentIndex + 1);
                } else {
                    targetIndex = Math.max(0, currentIndex - 1);
                }
            } else if (Math.abs(movedDistance) > dragDistanceRatio) {
                if (movedDistance > 0) {
                    targetIndex = Math.min(items.length - 1, currentIndex + 1);
                } else {
                    targetIndex = Math.max(0, currentIndex - 1);
                }
            }

            setPosition(targetIndex);
        }

        carouselTrack.addEventListener('mousedown', dragStart);
        window.addEventListener('mousemove', dragMove);
        window.addEventListener('mouseup', dragEnd);

        carouselTrack.addEventListener('touchstart', dragStart);
        window.addEventListener('touchmove', dragMove);
        window.addEventListener('touchend', dragEnd);

        window.addEventListener('mouseleave', dragEnd);

        carouselTrack.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (isDragging) {
                    e.preventDefault();
                }
            });
        });
    };

    init();
})();
