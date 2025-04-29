"use client";

import { useLottie } from "lottie-react";
import animationData from "../../../public/animation/error_animation_alert.json";

export default function ErrorAnimation() {
    const options = {
        animationData,
        loop: true,
        autoplay: true,
    };

    const { View } = useLottie(options);

    return <div className="w-20 h-20 mb-3">{View}</div>;
}
