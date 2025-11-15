# TravelIQ Update Instructions

## Files to Update in Your Local Folder

Copy these updated files from the `traveliq_UPDATED_FILES` folder to your local traveliq directory:

### 1. Blog Posts (Required)
**File**: `posts.tsx`  
**Destination**: `traveliq/src/blog/posts.tsx`  
**Changes**: 
- Added new blog post: "The Secret AI Playbook: 3 Advanced Workflows 99% of People Don't Know"
- Replaced fabricated content with real TravelIQ-focused posts
- 5 total blog posts now (all promotional content)

### 2. Homepage (Important)
**File**: `HomePage.tsx`  
**Destination**: `traveliq/src/pages/HomePage.tsx`  
**Changes**: 
- Fixed news ticker to fetch current travel news (no more January 2025 dates)
- Added time filtering: `tbs: "qdr:d"` for last day's news
- Improved query: "travel trade news 2025 UK agents suppliers"
- Better fallback news articles

### 3. Environment Configuration (Optional)
**File**: `.env.example`  
**Destination**: `traveliq/.env.example`  
**Changes**: 
- Updated documentation for API keys
- Added clearer guidance for Serper API setup

### 4. Content Guidelines (Optional)
**File**: `BLOG-GUIDELINES.md`  
**Destination**: `traveliq/BLOG-GUIDELINES.md`  
**Changes**: 
- New file with content creation guidelines
- Ensures future blog posts follow TravelIQ standards

## Steps to Deploy

1. **Copy Files**: Copy the 4 files above to your local traveliq folder

2. **Navigate to Your Folder**:
   ```
   cd C:\Users\Malou\Downloads\traveliq\traveliq
   ```

3. **Check Git Status**:
   ```
   git status
   ```

4. **Add Changes**:
   ```
   git add .
   ```

5. **Commit Changes**:
   ```
   git commit -m "Update blog posts with real content and fix news ticker for current news"
   ```

6. **Push to GitHub**:
   ```
   git push origin main
   ```

7. **Wait for Cloudflare**: Cloudflare Pages will automatically rebuild your site

8. **Test the Live Site**:
   - Check that the Blog page shows your 4+1 real posts
   - Verify the news ticker shows current travel industry news
   - No more outdated January 2025 dates

## What You'll See After Deployment

✅ **Blog Page**: 5 promotional blog posts focusing exclusively on TravelIQ
✅ **News Ticker**: Current travel industry news (last 24 hours)
✅ **No Fabricated Content**: All supplier references removed
✅ **Real Testimonials**: None (only platform-focused content as requested)

Your TravelIQ site will now display authentic, current content that promotes your platform without any fabricated testimonials or outdated information.
