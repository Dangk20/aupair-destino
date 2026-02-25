import { companiesLogo } from "@/data/companiesLogo";
import React from "react";
import Marquee from "react-fast-marquee";

export default function TrustedCompanies() {
    return (
        <>
            <h3 className="text-base text-center text-slate-400 mt-28 pb-14 font-medium">
                Trusting by leading brands, including —
            </h3>
            <Marquee className="max-w-5xl mx-auto" gradient={true} speed={25}>
                <div className="flex items-center justify-center">
                    {[...companiesLogo, ...companiesLogo].map((company, index) => (
                        <React.Fragment key={index}>
                            {company.logo}
                        </React.Fragment>
                    ))}
                </div>
            </Marquee>
        </>
    );
}