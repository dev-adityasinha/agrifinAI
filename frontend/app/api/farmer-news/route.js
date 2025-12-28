import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';

    // NewsData.io API configuration
    const NEWS_API_KEY = process.env.NEWSDATA_API_KEY || 'pub_21ec913e799c4a468eabebab0ae944f7';
    
    // Build query based on category
    let query = 'farmers OR agriculture OR farming';
    if (category !== 'all') {
      const categoryQueries = {
        agriculture: 'farmers AND agriculture',
        farming: 'farmers AND farming',
        crops: 'farmers AND (crops OR wheat OR rice)',
        livestock: 'farmers AND (livestock OR cattle OR poultry)',
        technology: 'farmers AND (technology OR innovation OR tech)'
      };
      query = categoryQueries[category] || query;
    }

    const apiUrl = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=en&category=business,technology`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'success' && data.results) {
      // Filter and format news data
      const farmerNews = data.results
        .filter(article => {
          const content = `${article.title} ${article.description || ''}`.toLowerCase();
          return content.includes('farmer') || content.includes('farm') || content.includes('agriculture');
        })
        .map(article => ({
          title: article.title,
          description: article.description || article.content || 'No description available',
          link: article.link,
          source: article.source_id || 'Unknown',
          date: article.pubDate,
          image: article.image_url,
          category: determineCategory(article)
        }));

      return NextResponse.json({
        success: true,
        news: farmerNews,
        count: farmerNews.length
      });
    }

    // Fallback sample news
    return NextResponse.json({
      success: true,
      news: getSampleNews(),
      count: 10,
      note: 'Using sample news data'
    });

  } catch (error) {
    console.error('Error fetching farmer news:', error);
    
    // Return sample news on error
    return NextResponse.json({
      success: true,
      news: getSampleNews(),
      count: 10,
      note: 'Using sample news due to API error'
    });
  }
}

// Determine news category based on content
function determineCategory(article) {
  const content = `${article.title} ${article.description || ''}`.toLowerCase();
  
  if (!content.includes('farmer') && !content.includes('farm')) {
    return null; // Filter out non-farmer content
  }
  
  if (content.includes('crop') || content.includes('wheat') || content.includes('rice') || content.includes('harvest')) {
    return 'crops';
  }
  if (content.includes('livestock') || content.includes('cattle') || content.includes('poultry') || content.includes('dairy')) {
    return 'livestock';
  }
  if (content.includes('tech') || content.includes('innovation') || content.includes('digital') || content.includes('ai')) {
    return 'technology';
  }
  if (content.includes('agriculture') || content.includes('agricultural')) {
    return 'agriculture';
  }
  
  return 'farming';
}

// Sample farmer news for fallback
function getSampleNews() {
  return [
    {
      title: "Government Announces New Subsidy Scheme for Small Farmers",
      description: "The agricultural ministry has unveiled a comprehensive subsidy program aimed at supporting small-scale farmers with financial assistance for seeds, fertilizers, and modern farming equipment.",
      link: "#",
      source: "Agriculture Today",
      date: new Date().toISOString(),
      image: null,
      category: "farming"
    },
    {
      title: "Record Wheat Production Expected This Season",
      description: "Favorable weather conditions and improved farming techniques are projected to lead to record wheat yields across major agricultural states this harvest season.",
      link: "#",
      source: "Farm News Network",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      image: null,
      category: "crops"
    },
    {
      title: "Dairy Farmers Adopt AI-Powered Milking Technology",
      description: "Innovative artificial intelligence systems are revolutionizing dairy farming, helping farmers monitor cattle health and optimize milk production efficiently.",
      link: "#",
      source: "Tech Agriculture",
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      image: null,
      category: "technology"
    },
    {
      title: "Organic Farming Practices Gain Momentum Among Indian Farmers",
      description: "More farmers are transitioning to organic farming methods, driven by consumer demand for chemical-free produce and sustainable agricultural practices.",
      link: "#",
      source: "Sustainable Farming Journal",
      date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      image: null,
      category: "agriculture"
    },
    {
      title: "New Irrigation System Helps Farmers Save Water and Increase Yields",
      description: "Advanced drip irrigation technology is enabling farmers to conserve water while improving crop productivity in water-scarce regions.",
      link: "#",
      source: "Agricultural Innovation",
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      image: null,
      category: "technology"
    },
    {
      title: "Livestock Vaccination Drive Launched in Rural Areas",
      description: "A nationwide campaign to vaccinate cattle and poultry against common diseases has been initiated to protect farmers' livelihoods.",
      link: "#",
      source: "Livestock Health News",
      date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      image: null,
      category: "livestock"
    },
    {
      title: "Farmers Protest Against Rising Fertilizer Prices",
      description: "Agricultural workers across the country are demanding government intervention to control escalating costs of essential farming inputs.",
      link: "#",
      source: "Rural Voice",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      image: null,
      category: "farming"
    },
    {
      title: "Rice Exports Hit All-Time High Despite Global Challenges",
      description: "Indian rice farmers are benefiting from strong international demand, with export volumes reaching unprecedented levels this quarter.",
      link: "#",
      source: "Export Agriculture Weekly",
      date: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      image: null,
      category: "crops"
    },
    {
      title: "Solar-Powered Agriculture: Farmers Embrace Renewable Energy",
      description: "Solar panels are being installed on farms to power irrigation pumps and processing equipment, reducing electricity costs significantly.",
      link: "#",
      source: "Green Farming Magazine",
      date: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      image: null,
      category: "technology"
    },
    {
      title: "Crop Insurance Scheme Reaches 50 Million Farmers",
      description: "The government's flagship crop insurance program has successfully enrolled over 50 million farmers, providing financial security against crop failures.",
      link: "#",
      source: "Insurance & Agriculture",
      date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      image: null,
      category: "agriculture"
    }
  ];
}
