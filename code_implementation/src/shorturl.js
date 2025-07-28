import React, { useState, useEffect } from 'react';

const URLShortenerApp = () => {
  const [currentPage, setCurrentPage] = useState('shortener');
  const [urls, setUrls] = useState([]);
  const [formData, setFormData] = useState({
    originalUrl: '',
    validity: 30,
    customShortcode: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const savedUrls = JSON.parse(localStorage.getItem('urlShortenerData') || '[]');
    setUrls(savedUrls);
  }, []);

  useEffect(() => {
    localStorage.setItem('urlShortenerData', JSON.stringify(urls));
  }, [urls]);

  const generateShortcode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };


  const isValidShortcode = (shortcode) => {
    return /^[a-zA-Z0-9]+$/.test(shortcode);
  };


  const isUniqueShortcode = (shortcode) => {
    return !urls.some(url => url.shortcode === shortcode);
  };


  const handleSubmit = () => {
    const newErrors = {};

    if (!formData.originalUrl) {
      newErrors.originalUrl = 'Original URL is required';
    } else if (!isValidUrl(formData.originalUrl)) {
      newErrors.originalUrl = 'Please enter a valid URL';
    }

    if (!Number.isInteger(Number(formData.validity)) || formData.validity < 1) {
      newErrors.validity = 'Validity must be a positive integer';
    }

    if (formData.customShortcode) {
      if (!isValidShortcode(formData.customShortcode)) {
        newErrors.customShortcode = 'Shortcode must be alphanumeric';
      } else if (!isUniqueShortcode(formData.customShortcode)) {
        newErrors.customShortcode = 'Shortcode already exists';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const shortcode = formData.customShortcode || generateShortcode();
      const now = new Date();
      const expiryDate = new Date(now.getTime() + formData.validity * 60 * 1000);
      
      const newUrl = {
        id: Date.now(),
        originalUrl: formData.originalUrl,
        shortcode: shortcode,
        shortUrl: `http://localhost:3000/${shortcode}`,
        createdAt: now,
        expiryDate: expiryDate,
        clicks: 0,
        clickData: []
      };

      setUrls([...urls, newUrl]);
      setSuccessMessage(`URL shortened successfully! Short URL: http://localhost:3000/${shortcode}`);
      setFormData({ originalUrl: '', validity: 30, customShortcode: '' });
      
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const handleRedirect = (urlData) => {
    const now = new Date();
    
    if (now > new Date(urlData.expiryDate)) {
      alert('This short URL has expired');
      return;
    }

    const clickInfo = {
      timestamp: now,
      source: 'Direct Click',
      location: 'Hyderabad, India'
    };

    const updatedUrls = urls.map(url => {
      if (url.id === urlData.id) {
        return {
          ...url,
          clicks: url.clicks + 1,
          clickData: [...url.clickData, clickInfo]
        };
      }
      return url;
    });

    setUrls(updatedUrls);
    
    window.open(urlData.originalUrl, '_blank');
  };

  const activeUrls = urls.filter(url => new Date() <= new Date(url.expiryDate));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>URL Shortener</h1>
        <nav style={styles.nav}>
          <button 
            style={{...styles.navButton, ...(currentPage === 'shortener' ? styles.activeNavButton : {})}}
            onClick={() => setCurrentPage('shortener')}
          >
            URL Shortener
          </button>
          <button 
            style={{...styles.navButton, ...(currentPage === 'statistics' ? styles.activeNavButton : {})}}
            onClick={() => setCurrentPage('statistics')}
          >
            Statistics
          </button>
        </nav>
      </div>

      {currentPage === 'shortener' && (
        <div style={styles.page}>
          <h2 style={styles.pageTitle}>Shorten Your URLs</h2>
          <p style={styles.description}>
            Enter up to 5 URLs to shorten them. Each URL can have a custom validity period and optional shortcode.
          </p>

          {successMessage && (
            <div style={styles.successMessage}>
              {successMessage}
            </div>
          )}

          <form style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Original URL *</label>
              <input
                type="url"
                value={formData.originalUrl}
                onChange={(e) => setFormData({...formData, originalUrl: e.target.value})}
                style={{...styles.input, ...(errors.originalUrl ? styles.inputError : {})}}
                placeholder="https://example.com/very-long-url"
              />
              {errors.originalUrl && <span style={styles.error}>{errors.originalUrl}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Validity Period (minutes) *</label>
              <input
                type="number"
                value={formData.validity}
                onChange={(e) => setFormData({...formData, validity: parseInt(e.target.value) || 30})}
                style={{...styles.input, ...(errors.validity ? styles.inputError : {})}}
                placeholder="30"
                min="1"
              />
              {errors.validity && <span style={styles.error}>{errors.validity}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Custom Shortcode (optional)</label>
              <input
                type="text"
                value={formData.customShortcode}
                onChange={(e) => setFormData({...formData, customShortcode: e.target.value})}
                style={{...styles.input, ...(errors.customShortcode ? styles.inputError : {})}}
                placeholder="myCustomCode"
              />
              {errors.customShortcode && <span style={styles.error}>{errors.customShortcode}</span>}
            </div>

            <button type="button" onClick={handleSubmit} style={styles.submitButton}>
              Shorten URL
            </button>
          </form>

          {activeUrls.length > 0 && (
            <div style={styles.resultsSection}>
              <h3 style={styles.sectionTitle}>Your Shortened URLs</h3>
              {activeUrls.slice(-5).reverse().map((url) => (
                <div key={url.id} style={styles.urlCard}>
                  <div style={styles.urlInfo}>
                    <p style={styles.originalUrl}>
                      <strong>Original:</strong> {url.originalUrl}
                    </p>
                    <p style={styles.shortUrl}>
                      <strong>Short URL:</strong> 
                      <span 
                        style={styles.clickableUrl}
                        onClick={() => handleRedirect(url)}
                      >
                        {url.shortUrl}
                      </span>
                    </p>
                    <p style={styles.urlMeta}>
                      <strong>Expires:</strong> {new Date(url.expiryDate).toLocaleString()} | 
                      <strong> Clicks:</strong> {url.clicks}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentPage === 'statistics' && (
        <div style={styles.page}>
          <h2 style={styles.pageTitle}>URL Statistics</h2>
          <p style={styles.description}>
            View detailed analytics for all your shortened URLs.
          </p>

          {urls.length === 0 ? (
            <p style={styles.emptyState}>No URLs have been shortened yet.</p>
          ) : (
            <div style={styles.statsContainer}>
              {urls.map((url) => (
                <div key={url.id} style={styles.statsCard}>
                  <div style={styles.statsHeader}>
                    <h3 style={styles.statsTitle}>{url.shortcode}</h3>
                    <span style={{
                      ...styles.statusBadge,
                      ...(new Date() > new Date(url.expiryDate) ? styles.expiredBadge : styles.activeBadge)
                    }}>
                      {new Date() > new Date(url.expiryDate) ? 'Expired' : 'Active'}
                    </span>
                  </div>
                  
                  <div style={styles.statsDetails}>
                    <p><strong>Original URL:</strong> {url.originalUrl}</p>
                    <p><strong>Short URL:</strong> {url.shortUrl}</p>
                    <p><strong>Created:</strong> {new Date(url.createdAt).toLocaleString()}</p>
                    <p><strong>Expires:</strong> {new Date(url.expiryDate).toLocaleString()}</p>
                    <p><strong>Total Clicks:</strong> {url.clicks}</p>
                  </div>

                  {url.clickData.length > 0 && (
                    <div style={styles.clickDataSection}>
                      <h4 style={styles.clickDataTitle}>Click Details:</h4>
                      {url.clickData.slice(-5).reverse().map((click, index) => (
                        <div key={index} style={styles.clickItem}>
                          <p><strong>Time:</strong> {new Date(click.timestamp).toLocaleString()}</p>
                          <p><strong>Source:</strong> {click.source}</p>
                          <p><strong>Location:</strong> {click.location}</p>
                        </div>
                      ))}
                      {url.clickData.length > 5 && (
                        <p style={styles.moreClicks}>... and {url.clickData.length - 5} more clicks</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    backgroundColor: '#2c035aff',
    color: 'white',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    margin: '0 0 1rem 0',
    fontSize: '2rem',
    fontWeight: 'bold'
  },
  nav: {
    display: 'flex',
    gap: '1rem'
  },
  navButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'white',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  },
  activeNavButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    fontWeight: 'bold'
  },
  page: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem'
  },
  pageTitle: {
    fontSize: '1.8rem',
    marginBottom: '0.5rem',
    color: '#333'
  },
  description: {
    color: '#666',
    marginBottom: '2rem',
    lineHeight: '1.5'
  },
  successMessage: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  form: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  inputError: {
    borderColor: '#f44336'
  },
  error: {
    color: '#f44336',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
    display: 'block'
  },
  submitButton: {
    backgroundColor: '#2c035aff',
    color: 'white',
    padding: '0.75rem 2rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  },
  resultsSection: {
    marginTop: '2rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#333'
  },
  urlCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '1rem'
  },
  urlInfo: {
    lineHeight: '1.6'
  },
  originalUrl: {
    margin: '0 0 0.5rem 0',
    wordBreak: 'break-all'
  },
  shortUrl: {
    margin: '0 0 0.5rem 0'
  },
  clickableUrl: {
    color: '#2196F3',
    cursor: 'pointer',
    textDecoration: 'underline',
    marginLeft: '0.5rem'
  },
  urlMeta: {
    margin: '0',
    color: '#666',
    fontSize: '0.9rem'
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    fontSize: '1.1rem',
    padding: '3rem'
  },
  statsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  statsCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  statsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  statsTitle: {
    margin: 0,
    fontSize: '1.3rem',
    color: '#333'
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    color: 'white'
  },
  expiredBadge: {
    backgroundColor: '#f44336',
    color: 'white'
  },
  statsDetails: {
    lineHeight: '1.6',
    marginBottom: '1rem'
  },
  clickDataSection: {
    borderTop: '1px solid #eee',
    paddingTop: '1rem'
  },
  clickDataTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    color: '#333'
  },
  clickItem: {
    backgroundColor: '#f9f9f9',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    fontSize: '0.9rem'
  },
  moreClicks: {
    color: '#666',
    fontStyle: 'italic',
    margin: '0.5rem 0 0 0'
  }
};

export default URLShortenerApp;