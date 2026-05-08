const axios = require("axios");

const extractVideoId = (url) => {
  const regex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;

  const match = url.match(regex);

  return match ? match[1] : null;
};

const validateYoutubeVideo = async (url) => {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos`,
    {
      params: {
        part: "snippet,contentDetails",
        id: videoId,
        key: process.env.YOUTUBE_API_KEY
      }
    }
  );

  const video = response.data.items[0];

  if (!video) {
    throw new Error("YouTube video not found");
  }

  return {
    videoId,
    title: video.snippet.title,
    thumbnail: video.snippet.thumbnails.high.url,
    channel: video.snippet.channelTitle,
    duration: video.contentDetails.duration
  };
};

module.exports = {
  validateYoutubeVideo
};