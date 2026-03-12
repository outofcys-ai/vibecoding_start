document.addEventListener('DOMContentLoaded', () => {
  const newsContainer = document.getElementById('news-container');
  const modal = document.getElementById('news-modal');
  const iframe = document.getElementById('news-frame');
  const closeButton = document.querySelector('.close-button');

  // Fetch news from Google News RSS feed (Korean AI news)
  const getAINews = async () => {
    const rssUrl = 'https://news.google.com/rss/search?q=%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5&hl=ko&gl=KR&ceid=KR:ko';
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Fetch failed');
      
      const data = await response.json();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, "text/xml");
      const items = xmlDoc.querySelectorAll("item");

      return Array.from(items).map(item => {
        const title = item.querySelector("title").textContent;
        const url = item.querySelector("link").textContent;
        const descriptionHtml = item.querySelector("description").textContent;
        
        // 이미지 태그에서 src 속성만 추출
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = descriptionHtml;
        const img = tempDiv.querySelector('img');
        const imageUrl = img ? img.src : 'https://via.placeholder.com/300x180?text=No+Image';
        const descriptionText = tempDiv.innerText || tempDiv.textContent;

        return { title, url, imageUrl, descriptionText };
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  };

  const openModal = (url) => {
    // 구글 뉴스 리다이렉션 방지 및 새 창 열림 방지를 위해 iframe 소스 설정
    iframe.src = url;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.style.display = 'none';
    iframe.src = '';
    document.body.style.overflow = 'auto';
  };

  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const displayNews = async () => {
    newsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">뉴스를 불러오는 중...</p>';
    
    const articles = await getAINews();
    if (articles.length > 0) {
      newsContainer.innerHTML = '';
      articles.forEach(article => {
        const card = document.createElement('article');
        
        // 카드 내부에 이미지와 요약 텍스트 배치
        card.innerHTML = `
          <div class="news-image" style="background-image: url('${article.imageUrl}')"></div>
          <div class="content-wrapper">
            <h2><a href="#">${article.title}</a></h2>
            <div class="description-text">${article.descriptionText}</div>
          </div>
        `;
        
        // 뉴스 카드 클릭 시 무조건 모달 오픈 (링크 클릭 포함)
        card.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openModal(article.url);
        });
        
        newsContainer.appendChild(card);
      });
    } else {
      newsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">뉴스를 불러오는데 실패했습니다.</p>';
    }
  };

  displayNews();
});
