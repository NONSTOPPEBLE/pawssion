import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  CirclePlay,
  Heart,
  Minus,
  Move3D,
  Pause,
  Play,
  Plus,
  Upload,
  X,
} from "lucide-react";

const CatScene = lazy(() => import("./components/CatScene"));

type ScenePalette = {
  name: string;
  fur: string;
  collar: string;
  sensor: string;
};

const palettes: ScenePalette[] = [
  { name: "Cloud & Sage", fur: "#F7F1E8", collar: "#6D9276", sensor: "#91D3A3" },
  { name: "Champagne Gold", fur: "#B7AA94", collar: "#C4A575", sensor: "#E4C78D" },
  { name: "Emerald Cyber", fur: "#52665B", collar: "#29483B", sensor: "#73F0B7" },
];

const videoChoices = [
  { label: "PAWSSION — Film 01", src: new URL("../gemini_generated_video_72f51539.mp4", import.meta.url).href },
  { label: "PAWSSION — Film 02", src: new URL("../gemini_generated_video_54880c9c.mp4", import.meta.url).href },
];

function useTelemetry(progress: MotionValue<number>) {
  const [percent, setPercent] = useState(0);
  const [fps, setFps] = useState(60);

  useMotionValueEvent(progress, "change", (value) => {
    setPercent(Math.round(value * 100));
  });

  useEffect(() => {
    let frame = 0;
    let frames = 0;
    let lastReport = performance.now();
    let alive = true;

    const tick = (now: number) => {
      frames += 1;
      if (now - lastReport >= 700) {
        setFps(Math.min(60, Math.round((frames * 1000) / (now - lastReport))));
        frames = 0;
        lastReport = now;
      }
      if (alive) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, []);

  return { percent, fps };
}

function ActCopy({
  progress,
  range,
  className,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  className: string;
  children: React.ReactNode;
}) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0], { clamp: true });
  const y = useTransform(progress, range, [24, 0, 0, -20], { clamp: true });
  const filter = useTransform(progress, range, ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"], { clamp: true });

  return (
    <motion.div
      className={className}
      style={{ opacity, y, filter }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const runwayRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef("");
  const petTimerRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const syncAfterSeekRef = useRef<(() => void) | null>(null);
  const autoPlayingRef = useRef(false);
  const [mode, setMode] = useState<"studio" | "video">("video");
  const [cameraAngle, setCameraAngle] = useState(0);
  const [cameraDistance, setCameraDistance] = useState(7.8);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [videoSrc, setVideoSrc] = useState(videoChoices[0].src);
  const [videoTitle, setVideoTitle] = useState(videoChoices[0].label);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [bagAdded, setBagAdded] = useState(false);
  const [scrollCueVisible, setScrollCueVisible] = useState(true);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const [petting, setPetting] = useState(false);
  const [minimumLoadingTimeElapsed, setMinimumLoadingTimeElapsed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const isLoading = !minimumLoadingTimeElapsed || !videoReady;

  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });
  const scrollProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.0005,
  });
  const { percent, fps } = useTelemetry(scrollProgress);
  const currentPalette = palettes[paletteIndex];

  useEffect(() => {
    const timer = window.setTimeout(() => setMinimumLoadingTimeElapsed(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  const petCompanion = useCallback(() => {
    setPetting(true);
    if (petTimerRef.current !== null) window.clearTimeout(petTimerRef.current);
    petTimerRef.current = window.setTimeout(() => {
      setPetting(false);
      petTimerRef.current = null;
    }, 1800);
  }, []);

  const actFour = useTransform(scrollProgress, [0.77, 0.85, 1], [0, 1, 1]);
  const actFourY = useTransform(scrollProgress, [0.77, 0.85], [26, 0]);

  const syncVideoToScroll = useCallback(() => {
    const video = videoRef.current;
    const runway = runwayRef.current;
    if (autoPlayingRef.current || !video || !runway || video.readyState < 1 || !Number.isFinite(video.duration)) return;

    const scrollDistance = runway.offsetHeight - window.innerHeight;
    const progress = scrollDistance > 0
      ? Math.min(1, Math.max(0, -runway.getBoundingClientRect().top / scrollDistance))
      : 0;
    const nextTime = Math.min(progress * video.duration, Math.max(0, video.duration - 0.001));

    if (!video.seeking && Math.abs(nextTime - lastVideoTimeRef.current) > 0.015) {
      video.currentTime = nextTime;
      lastVideoTimeRef.current = nextTime;
    }
  }, []);

  const stopAutoPlayback = useCallback(() => {
    autoPlayingRef.current = false;
    videoRef.current?.pause();
    setAutoPlaying(false);
  }, []);

  const toggleAutoPlayback = () => {
    if (autoPlayingRef.current) {
      stopAutoPlayback();
      return;
    }

    const video = videoRef.current;
    const runway = runwayRef.current;
    if (!video || !runway || !Number.isFinite(video.duration) || video.duration <= 0) return;
    if (video.ended || video.currentTime >= video.duration - 0.05) {
      video.currentTime = 0;
      lastVideoTimeRef.current = 0;
      window.scrollTo(0, runway.offsetTop);
    }
    setPlaybackError(false);
    autoPlayingRef.current = true;
    void video.play().then(() => {
      setAutoPlaying(true);
    }).catch(() => {
      autoPlayingRef.current = false;
      setPlaybackError(true);
    });
  };

  useEffect(() => {
    if (mode !== "video") return;
    let frame = 0;
    const scheduleSync = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        syncVideoToScroll();
      });
    };

    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    const video = videoRef.current;
    const onSeeked = () => scheduleSync();
    video?.addEventListener("seeked", onSeeked);
    syncAfterSeekRef.current = scheduleSync;
    scheduleSync();
    return () => {
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      video?.removeEventListener("seeked", onSeeked);
      syncAfterSeekRef.current = null;
      if (frame) cancelAnimationFrame(frame);
    };
  }, [mode, videoSrc, syncVideoToScroll]);

  useEffect(() => {
    if (!autoPlaying || mode !== "video") return;
    const video = videoRef.current;
    const runway = runwayRef.current;
    if (!video || !runway) {
      stopAutoPlayback();
      return;
    }

    let frame = 0;
    const followPlayback = () => {
      if (video.ended) {
        stopAutoPlayback();
        return;
      }
      const scrollDistance = runway.offsetHeight - window.innerHeight;
      const progress = video.duration > 0 ? video.currentTime / video.duration : 0;
      window.scrollTo(0, runway.offsetTop + scrollDistance * progress);
      frame = requestAnimationFrame(followPlayback);
    };
    const interruptPlayback = () => stopAutoPlayback();
    const interruptWithKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        stopAutoPlayback();
      }
    };

    frame = requestAnimationFrame(followPlayback);
    window.addEventListener("wheel", interruptPlayback, { passive: true });
    window.addEventListener("touchstart", interruptPlayback, { passive: true });
    window.addEventListener("keydown", interruptWithKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", interruptPlayback);
      window.removeEventListener("touchstart", interruptPlayback);
      window.removeEventListener("keydown", interruptWithKey);
    };
  }, [autoPlaying, mode, stopAutoPlayback]);

  useMotionValueEvent(scrollProgress, "change", (value) => {
    if (value > 0.04) setScrollCueVisible(false);
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "u" && !event.repeat) {
        const target = event.target as HTMLElement | null;
        if (target?.isContentEditable || target?.matches("input, textarea, select")) return;
        setUploadOpen((open) => !open);
      }
      if (event.key === "Escape") setUploadOpen(false);
    };
    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
      setIsDragging(true);
    };
    const onDragLeave = (event: DragEvent) => {
      if (event.relatedTarget === null) setIsDragging(false);
    };
    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const file = Array.from(event.dataTransfer?.files ?? []).find((item) =>
        item.type === "video/mp4" || item.name.toLowerCase().endsWith(".mp4"),
      );
      if (file) loadLocalVideo(file);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    if (petTimerRef.current !== null) window.clearTimeout(petTimerRef.current);
  }, []);

  const loadLocalVideo = useCallback((file: File) => {
    if (file.type !== "video/mp4" && !file.name.toLowerCase().endsWith(".mp4")) return;
    autoPlayingRef.current = false;
    setAutoPlaying(false);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setVideoSrc(url);
    setVideoTitle(file.name);
    setMode("video");
    setUploadOpen(false);
    lastVideoTimeRef.current = -1;
  }, []);

  const chooseVideo = (src: string, label: string) => {
    autoPlayingRef.current = false;
    setAutoPlaying(false);
    videoRef.current?.pause();
    setVideoSrc(src);
    setVideoTitle(label);
    setMode("video");
    lastVideoTimeRef.current = -1;
  };

  const scrollToOrder = () => {
    const runway = runwayRef.current;
    if (!runway) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const end = runway.offsetTop + runway.offsetHeight - window.innerHeight;
    window.scrollTo({ top: Math.min(max, end * 0.88), behavior: "smooth" });
  };

  const switchVisualMode = (nextMode: "studio" | "video") => {
    stopAutoPlayback();
    setMode(nextMode);
    if (nextMode === "studio") {
      setCameraAngle(0);
      setCameraDistance(7.8);
    }
    setScrollCueVisible(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const addToBag = () => {
    setBagAdded(true);
    window.setTimeout(() => setBagAdded(false), 2200);
  };

  const onFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) loadLocalVideo(file);
    event.currentTarget.value = "";
  };

  return (
    <main className="felis-experience">
      <section
        ref={runwayRef}
        className={mode === "studio" ? "story-runway studio-runway" : "story-runway"}
        aria-label={mode === "studio" ? "Interactive 3D cat studio" : "PAWSSION MK-I product story"}
      >
        <div className="visual-stage" aria-hidden="true">
          {mode === "studio" ? (
            <Suspense fallback={<div className="visual-loading" />}>
              <CatScene
                scrollProgress={scrollProgress}
                furColor={currentPalette.fur}
                collarColor={currentPalette.collar}
                sensorColor={currentPalette.sensor}
                onPet={petCompanion}
                soloCat
                cameraAngle={cameraAngle}
                cameraDistance={cameraDistance}
              />
            </Suspense>
          ) : (
            <video
              ref={videoRef}
              className="reference-video"
              src={videoSrc}
              muted
              playsInline
              preload="auto"
              onLoadedData={() => setVideoReady(true)}
              onError={() => {
                setPlaybackError(true);
                setVideoReady(true);
              }}
              onLoadedMetadata={() => {
                lastVideoTimeRef.current = -1;
                videoRef.current?.pause();
                syncAfterSeekRef.current?.();
              }}
              onEnded={stopAutoPlayback}
            />
          )}
          <div className="stage-vignette" />
          <div className="film-grain" />
        </div>

        <header className="editorial-header hud-interactive">
          <div className="brand-and-data">
            <a className="header-wordmark" href="#home" aria-label="PAWSSION home">PAWSSION<span>®</span></a>
            <div className="live-readout">
              <span><i className="live-dot" /> LIVE</span>
              <span>{fps} FPS</span>
              <span>{mode === "studio" ? "3D CAT" : `${String(percent).padStart(2, "0")}%`}</span>
            </div>
          </div>

          <div className="header-controls">
            <div className="mode-switch" role="group" aria-label="Visual mode">
              <button
                className={mode === "studio" ? "mode-active" : ""}
                onClick={() => switchVisualMode("studio")}
                aria-pressed={mode === "studio"}
              >
                <Move3D size={12} /> <span>3D STUDIO</span>
              </button>
              <button
                className={mode === "video" ? "mode-active" : ""}
                onClick={() => switchVisualMode("video")}
                aria-pressed={mode === "video"}
              >
                <CirclePlay size={12} /> <span>VIDEO SCRUB</span>
              </button>
            </div>

            {mode === "video" && (
              <label className="video-select-wrap">
                <span className="sr-only">Select reference video</span>
                <select
                  value={videoChoices.some((choice) => choice.src === videoSrc) ? videoSrc : "local"}
                  onChange={(event) => {
                    const selected = videoChoices.find((choice) => choice.src === event.target.value);
                    if (selected) chooseVideo(selected.src, selected.label);
                  }}
                  aria-label={`Current video: ${videoTitle}`}
                >
                  {videoChoices.map((choice) => <option key={choice.src} value={choice.src}>{choice.label}</option>)}
                  {videoSrc.startsWith("blob:") && <option value="local">{videoTitle}</option>}
                </select>
              </label>
            )}

            <div className="colorway-switch" role="group" aria-label="Companion finish">
              {palettes.map((item, index) => (
                <button
                  key={item.name}
                  className={paletteIndex === index ? "colorway-active" : ""}
                  style={{ "--colorway": item.sensor } as React.CSSProperties}
                  onClick={() => setPaletteIndex(index)}
                  aria-label={`${item.name} colorway`}
                  aria-pressed={paletteIndex === index}
                />
              ))}
            </div>

            <button className="reserve-button" onClick={scrollToOrder}>RESERVE — $249 <ArrowUpRight size={13} /></button>
          </div>
        </header>

        <div className="act-overlay">
          <ActCopy progress={scrollProgress} range={[-0.01, 0, 0.19, 0.26]} className="act-copy act-one">
            <div className="act-one-spec">
              <span className="micro-label"><i className="live-dot" /> POV CAMERA · LIVE GPS</span>
              <span className="act-one-subtitle">A new point of view<br />on a familiar world.</span>
              <span className="coordinate-readout">37° 46' 49.2" N<br />122° 25' 09.8" W</span>
            </div>
            <div className="act-one-headline">
              <span className="eyebrow-line">PAWSSION / MK–I</span>
              <h1>See the world<br />through <em>their eyes.</em></h1>
              <p>Every curious turn. Every secret garden.<br />A little closer to their world.</p>
              <button className="text-cta" onClick={scrollToOrder}>EXPLORE THE COLLAR <ArrowDown size={14} /></button>
            </div>
            <span className="video-film-credit"><CirclePlay size={13} /> SCROLL TO FEEL THE FILM</span>
          </ActCopy>

          <ActCopy progress={scrollProgress} range={[0.2, 0.275, 0.49, 0.565]} className="act-copy act-two">
            <span className="act-two-kicker">ENGINEERED FOR THE EVERYDAY EXTRAORDINARY</span>
            <div className="act-two-side act-two-left">
              <span className="micro-label">PRECISION OPTICS</span>
              <strong>4K MICRO<br />GIMBAL</strong>
              <i />
              <span>STABILIZED POV / 120° FIELD</span>
            </div>
            <div className="act-two-side act-two-right">
              <span className="micro-label">LOCATION INTELLIGENCE</span>
              <strong>SUB-METER<br />LIVE GPS</strong>
              <i />
              <span>REAL-TIME / ALWAYS IN RANGE</span>
            </div>
            <div className="act-two-bottom">
              <span><i /> 7-DAY SOLID STATE BATTERY</span>
              <span><i /> WEIGHT: 18 GRAMS</span>
            </div>
          </ActCopy>

          <ActCopy progress={scrollProgress} range={[0.52, 0.59, 0.73, 0.815]} className="act-copy act-three">
            <span className="micro-label"><i className="live-dot" /> THE WORLD IS WIDER THAN THE WINDOW</span>
            <h2>Out into<br /><em>the wild.</em></h2>
            <span className="act-three-foot">A SMALL COLLAR. A VERY BIG WORLD.</span>
          </ActCopy>

          <motion.div
            className="act-copy act-four"
            style={{ opacity: actFour, y: actFourY }}
          >
            <div className="act-four-heading">
              <span className="micro-label"><i className="live-dot" /> LIVE GPS / YOUR LITTLE EXPLORER</span>
              <h2>Wherever<br />they <em>roam.</em></h2>
              <span className="gps-telemetry"><i /> LAT 20.75° N <b>·</b> LON 73.68° E <b>·</b> STATUS: ROAMING</span>
            </div>

            <div className="edition-card hud-interactive">
              <div className="edition-card-top">
                <span>PAWSSION / MK–I</span>
                <span className="edition-live"><i /> PRE-ORDER OPEN</span>
              </div>
              <div className="edition-product">
                <div className={`product-render product-render-${paletteIndex}`}>
                  <span className="product-orbit" />
                  <span className="product-ring" />
                  <span className="product-sensor" />
                </div>
                <div className="edition-description">
                  <span className="micro-label">THE COMPANION COLLAR</span>
                  <strong>{currentPalette.name}</strong>
                  <span>4K POV · LIVE GPS · BIO-PULSE</span>
                </div>
              </div>
              <div className="edition-options">
                {palettes.map((item, index) => (
                  <button
                    key={item.name}
                    className={paletteIndex === index ? "edition-option edition-option-active" : "edition-option"}
                    onClick={() => setPaletteIndex(index)}
                    aria-pressed={paletteIndex === index}
                  >
                    <i style={{ backgroundColor: item.sensor }} />
                    {item.name}
                  </button>
                ))}
              </div>
              <button className={bagAdded ? "bag-button bag-added" : "bag-button"} onClick={addToBag}>
                <span>{bagAdded ? "ADDED TO YOUR BAG" : "ADD TO BAG — $249"}</span>
                {bagAdded ? <Check size={15} /> : <ArrowUpRight size={15} />}
              </button>
              <span className="edition-footnote">COMPLIMENTARY SHIPPING · 30-DAY RETURNS</span>
            </div>
          </motion.div>
        </div>

        {mode === "studio" && (
          <>
            <div className="studio-caption">
              <span>PAWSSION / COMPANION STUDIO</span>
              <p>They follow your gaze. Give them a little hello.</p>
            </div>
            <div className="studio-view-controls hud-interactive">
              <span className="studio-control-label">VIEW ANGLE</span>
              <div className="studio-angle-controls" role="group" aria-label="Cat viewing angle">
                {[
                  { label: "Front", angle: 0 },
                  { label: "3/4", angle: Math.PI / 4 },
                  { label: "Profile", angle: Math.PI / 2 },
                ].map((view) => (
                  <button
                    key={view.label}
                    className={cameraAngle === view.angle ? "studio-angle-active" : ""}
                    onClick={() => setCameraAngle(view.angle)}
                    aria-pressed={cameraAngle === view.angle}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
              <span className="studio-control-label studio-zoom-label">ZOOM</span>
              <div className="studio-zoom-controls" role="group" aria-label="Cat zoom">
                <button
                  onClick={() => setCameraDistance((distance) => Math.min(9, distance + 0.8))}
                  disabled={cameraDistance >= 9}
                  aria-label="Zoom out"
                >
                  <Minus size={13} />
                </button>
                <span>{cameraDistance <= 5.2 ? "CLOSE" : cameraDistance >= 7.6 ? "WIDE" : "MEDIUM"}</span>
                <button
                  onClick={() => setCameraDistance((distance) => Math.max(4.8, distance - 0.8))}
                  disabled={cameraDistance <= 4.8}
                  aria-label="Zoom in"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </>
        )}

        {mode === "video" && (
          <div className={`scroll-prompt ${scrollCueVisible ? "" : "scroll-prompt-hidden"}`} aria-hidden="true">
            <span>SCROLL TO EXPLORE</span><ArrowDown size={13} />
          </div>
        )}
        {mode === "video" && (
          <button
            className={`autoplay-button hud-interactive ${autoPlaying ? "autoplay-button-active" : ""}`}
            onClick={toggleAutoPlayback}
            aria-pressed={autoPlaying}
            title={playbackError ? "Video playback was blocked. Click to try again." : undefined}
          >
            {autoPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{playbackError ? "TAP TO RETRY" : autoPlaying ? "PAUSE FILM" : "AUTO PLAY FILM"}</span>
          </button>
        )}
        {mode === "studio" && (
          <button className={`pet-button hud-interactive ${petting ? "pet-button-active" : ""}`} onClick={petCompanion}>
            <Heart size={13} />
            <span>{petting ? "PURRING — THANK YOU" : "TAP THE CAT TO SAY HELLO"}</span>
          </button>
        )}
        {mode === "video" && (
          <div className="story-progress" aria-hidden="true">
            <span>0{Math.min(4, Math.floor(percent / 25) + 1)} <i /> 04</span>
            <div><motion.i style={{ scaleX: scrollProgress, transformOrigin: "left" }} /></div>
          </div>
        )}

        {mode === "video" && (
          <button className="upload-hint hud-interactive" onClick={() => setUploadOpen(true)}>
            <Upload size={13} /> <span>PRESS U TO LOAD YOUR FILM</span>
          </button>
        )}

        <AnimatePresence>
          {uploadOpen && (
            <motion.div
              className="upload-modal hud-interactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setUploadOpen(false);
              }}
            >
              <motion.div
                className={`upload-panel ${isDragging ? "upload-panel-dragging" : ""}`}
                initial={{ y: 18, scale: 0.98 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 12, scale: 0.98 }}
              >
                <button className="upload-close" onClick={() => setUploadOpen(false)} aria-label="Close upload"><X size={16} /></button>
                <Upload size={21} />
                <span className="upload-kicker">YOUR FILM, YOUR STORY</span>
                <strong>{isDragging ? "Drop your film here" : "Bring a video to life."}</strong>
                <p>Choose an MP4 or drop it anywhere on the page.<br />Scroll to move through it frame by frame.</p>
                <button className="upload-select" onClick={() => fileInputRef.current?.click()}>CHOOSE AN MP4 <ArrowUpRight size={13} /></button>
                <span className="upload-shortcut">KEYBOARD SHORTCUT <kbd>U</kbd></span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <input ref={fileInputRef} className="sr-only" type="file" accept="video/mp4,.mp4" onChange={onFileInput} />
        <span className="sr-only" aria-live="polite">{mode === "video" ? `Video scrub mode: ${videoTitle}` : "3D studio mode"}</span>
      </section>
      <div className="scroll-spacer" aria-hidden="true" />
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="loading-screen"
            role="status"
            aria-live="polite"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
          >
            <div className="loading-topline">
              <span>PAWSSION<span className="loading-registered">®</span></span>
              <span>DEVELOPER FLEX</span>
            </div>
            <div className="loading-center">
              <div className="loading-name" aria-label="Developer: Vatsal Gavit">
                <span>VATSAL</span>
                <span className="loading-name-accent">GAVIT<span className="loading-period">.</span></span>
              </div>
              <span className="loading-role">DEVELOPER <i /> VATSAL GAVIT</span>
            </div>
            <div className="loading-bottomline">
              <div className="loading-progress" aria-hidden="true"><i /></div>
              <span>CREATIVE DEVELOPER</span>
              <span>MADE BY <strong>VATSAL GAVIT</strong></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
