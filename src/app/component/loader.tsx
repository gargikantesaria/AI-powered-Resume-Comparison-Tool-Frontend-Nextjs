import { useLottie } from "lottie-react";
import animationData from "../../../public/animation/scan_loader_animation.json";

export default function Loader() {
    const options = {
        animationData,
        loop: true,
        autoplay: true,
    };

    const { View } = useLottie(options);
    return (
        <div className="flex flex-col items-center justify-center h-[-webkit-fill-available]  max-w-screen-lg mx-auto p-3">
            <div className="h-70 w-70">
                {View}
            </div>
            <p className="text-(--primary-blue)">
                Almost there… Your document is under the <b>AI</b> lens.
            </p>
        </div>

    );
}
