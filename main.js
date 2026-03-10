document.addEventListener('DOMContentLoaded', () => {
  const newsContainer = document.getElementById('news-container');

  // Fetch news from AI Times RSS feed using rss2json
  const getAINews = async () => {
    const rssUrl = 'https://www.aitimes.com/rss/S1N6.xml';
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.status !== 'ok') {
        console.error('Error from rss2json API:', data.message);
        return [];
      }

      return data.items.map(item => ({
        title: item.title,
        url: item.link,
        description: item.description,
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  };


  const displayNews = async () => {
    const articles = await getAINews();
    if (articles.length > 0) {
      newsContainer.innerHTML = articles
        .map(
          article => `
      <article>
        <h2><a href="${article.url}" target="_blank">${article.title}</a></h2>
        <p>${article.description}</p>
      </article>
    `
        )
        .join('');
    } else {
      newsContainer.innerHTML = '<p>뉴스를 불러오는데 실패했습니다.</p>';
    }
  };

  displayNews();
});
