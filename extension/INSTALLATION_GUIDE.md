# LightDom Browser Extension - Installation Guide

## 🚀 Quick Start

### Prerequisites
- Chrome/Chromium browser (version 88+)
- Node.js server running on `http://localhost:3001`
- LightDom blockchain network running

### Installation Steps

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

2. **Load the Extension**
   - Click "Load unpacked"
   - Select the `/workspace/extension` folder
   - The extension should appear in your extensions list

3. **Configure the Extension**
   - Click the LightDom extension icon in the toolbar
   - Click "📊 Open Dashboard" to access the side panel
   - Go to Options page to configure blockchain settings

4. **Start Mining**
   - Click "Start Mining" in the popup or side panel
   - The extension will begin analyzing DOM and submitting optimizations

## 🔧 Configuration

### Blockchain Settings
- **Network URL**: `http://localhost:3001/blockchain`
- **User Address**: Your wallet address (optional)
- **Auto Mining**: Enable to start mining automatically on page load

### Optimization Settings
- **Remove Unused Elements**: Remove hidden/empty DOM elements
- **Optimize Styles**: Remove duplicate CSS rules
- **Remove Duplicate Scripts**: Remove duplicate JavaScript files
- **Compress Images**: Experimental image compression
- **Optimization Level**: 1-5 (higher = more aggressive)

### Performance Settings
- **Analysis Frequency**: How often to analyze DOM (5-60 seconds)
- **Batch Size**: Number of optimizations to process at once
- **Use Offscreen Analysis**: Use background processing for heavy operations
- **Enable Declarative Rules**: Block ads and tracking resources

## 📊 Features

### Mining Interface
- **Popup**: Quick start/stop mining and view basic stats
- **Side Panel**: Comprehensive dashboard with real-time metrics
- **Options Page**: Advanced configuration and rule management

### DOM Analysis
- **Real-time Monitoring**: Continuous DOM mutation observation
- **Optimization Detection**: Finds unused elements, duplicate styles, redundant scripts
- **Performance Metrics**: Tracks space saved, load time improvements
- **Blockchain Integration**: Submits optimizations to earn DSH tokens

### Resource Blocking
- **Ad Blocking**: Blocks advertisement scripts and images
- **Tracking Protection**: Blocks analytics and tracking scripts
- **Performance Optimization**: Modifies cache headers for better performance
- **Custom Rules**: Add your own blocking rules

## 🎯 Usage

### Starting Mining
1. Click the LightDom icon in the toolbar
2. Click "Start Mining" or use keyboard shortcut `Ctrl+Shift+L`
3. Navigate to any website to begin analysis
4. View real-time stats in the side panel

### Viewing Results
- **Side Panel**: Real-time metrics and recent optimizations
- **Notifications**: Browser notifications for successful optimizations
- **Options Page**: Detailed statistics and rule management

### Keyboard Shortcuts
- `Ctrl+Shift+L` (Windows) / `Cmd+Shift+L` (Mac): Toggle mining
- `Ctrl+Shift+D` (Windows) / `Cmd+Shift+D` (Mac): Open side panel

## 🔍 Troubleshooting

### Common Issues

**Extension Not Loading**
- Ensure Developer mode is enabled
- Check that all files are present in the extension folder
- Reload the extension if needed

**Mining Not Working**
- Verify the API server is running on `http://localhost:3001`
- Check browser console for error messages
- Ensure blockchain network is accessible

**No Optimizations Found**
- Try visiting different websites
- Check optimization settings in Options page
- Verify DOM analysis is enabled

**Performance Issues**
- Reduce analysis frequency in Options
- Disable offscreen analysis if causing problems
- Lower optimization aggressiveness level

### Debug Mode
- Open browser DevTools (F12)
- Check Console tab for LightDom messages
- Look for error messages related to API calls
- Verify network requests to localhost:3001

## 📈 Performance Tips

### Optimization Settings
- Start with optimization level 3 (balanced)
- Use analysis frequency of 30 seconds for most sites
- Enable offscreen analysis for better performance
- Use batch size of 10 for optimal processing

### Resource Management
- Enable declarative rules for better performance
- Block unnecessary tracking scripts
- Use custom rules for site-specific optimizations

### Monitoring
- Check side panel regularly for mining status
- Monitor space saved metrics
- Review optimization history
- Adjust settings based on performance

## 🛠️ Development

### File Structure
```
extension/
├── manifest.json              # Extension configuration
├── background.js              # Service worker
├── content.js                 # DOM analysis script
├── blockchain-miner.js        # Advanced mining logic
├── popup.html/js              # Quick access popup
├── sidepanel.html/js          # Main dashboard
├── options.html/js            # Configuration page
├── offscreen.html/js          # Heavy analysis engine
├── storage-manager.js         # Data persistence
├── declarative-rules.json     # Resource blocking rules
└── icons/                     # Extension icons
```

### API Integration
- Extension communicates with `http://localhost:3001/api/blockchain/submit-optimization`
- Sends DOM analysis data and receives mining rewards
- Handles blockchain network integration

### Customization
- Modify `declarative-rules.json` for custom blocking rules
- Update `background.js` for API endpoint changes
- Customize UI in HTML/CSS files
- Add new optimization types in content scripts

## 📞 Support

### Getting Help
- Check browser console for error messages
- Verify API server connectivity
- Review extension permissions
- Test with different websites

### Reporting Issues
- Include browser version and OS
- Provide console error messages
- Describe steps to reproduce
- Include relevant website URLs

---

**LightDom Extension v2.0** - Advanced DOM optimization and blockchain mining for the modern web.