const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ImageLoader({ src }: { src: string }) {
    return `${BASE_URL}${src}`;
}
