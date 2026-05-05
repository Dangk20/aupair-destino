import { FaqSection } from "@/sections/FaqSection";
import FeaturesSection from "@/sections/FeaturesSection";
import HeroSection1 from "@/sections/HeroSection1";
import Pricing from "@/sections/Pricing";
import Testimonials from "@/sections/Testimonials";
import TrustedCompanies from "@/sections/TrustedCompanies";
import MapSectionClient from "@/sections/MapSectionClient";

export default function Page() {
    return (
        <>
            <HeroSection1 />
            <TrustedCompanies />
            <FeaturesSection />
            <Testimonials />
            <Pricing />
            <MapSectionClient />
            <FaqSection />
        </>
    );
}