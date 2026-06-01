import { VideoItem } from "@shared/types";

interface VideoGalleryProps {
  videos: VideoItem[];
  className?: string;
}

export function VideoGallery({ videos, className }: VideoGalleryProps) {
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <section className={`video-gallery ${className || ""}`}>
      <h2>Video Terbaru</h2>
      <div className="video-grid">
        {videos.map((video) => (
          <div key={video.id} className="video-item">
            <div className="video-container">
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${video.youtube_id}`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="video-info">
              <h3>{video.title}</h3>
              {video.description && <p>{video.description}</p>}
              {video.published_at && (
                <time dateTime={video.published_at}>
                  {new Date(video.published_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .video-gallery {
          margin: 2rem 0;
        }

        .video-gallery h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .video-item {
          border-radius: 0.5rem;
          overflow: hidden;
          background: #f9fafb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .video-item:hover {
          transform: translateY(-0.25rem);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }

        .video-container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          background: #000;
        }

        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .video-info {
          padding: 1rem;
        }

        .video-info h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
        }

        .video-info p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.75rem 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .video-info time {
          font-size: 0.8rem;
          color: #9ca3af;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .video-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
