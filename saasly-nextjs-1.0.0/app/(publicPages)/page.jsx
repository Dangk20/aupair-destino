import BottomBanner from "@/sections/BottomBanner";
import { FaqSection } from "@/sections/FaqSection";
import FeaturesSection from "@/sections/FeaturesSection";
import HeroSection from "@/sections/HeroSection";
import HeroSection1 from "@/sections/HeroSection1";
import Pricing from "@/sections/Pricing";
import Testimonials from "@/sections/Testimonials";
import TrustedCompanies from "@/sections/TrustedCompanies";
import PortalFeatures from "@/sections/PortalFeatures";

export default function Page() {
    return (
        <>
            <HeroSection1 />
            <FeaturesSection />
            <PortalFeatures />
            <Testimonials />
            <Pricing />
            <FaqSection />
        </>
    );
}