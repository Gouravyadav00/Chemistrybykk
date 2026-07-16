import About from "@/components/About";
import ClayBackground from "@/components/ClayBackground";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import LearningHub from "@/components/LearningHub";
import Navbar from "@/components/Navbar";
import SignInToast from "@/components/SignInToast";
import SocialLinks from "@/components/SocialLinks";
import Testimonials from "@/components/Testimonials";
import VideoLectures from "@/components/VideoLectures";
import VisitPing from "@/components/VisitPing";
import WalkthroughVideo from "@/components/WalkthroughVideo";

export default function HomePage() {
  return (
    <>
      <ClayBackground />
      <Navbar />
      <SignInToast />
      <VisitPing />
      <main>
        <Hero />
        <About />
        <WalkthroughVideo />
        <LearningHub />
        <VideoLectures />
        <Testimonials />
        <SocialLinks />
      </main>
      <Footer />
    </>
  );
}
