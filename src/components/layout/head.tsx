import appConfig from "@/lib/core/config";

export default function Head() {
    const urls = [
        ...new Set(
            [appConfig.SERVER_URL, appConfig.BLOB_URL].filter(
                (url): url is string => Boolean(url),
            ),
        ),
    ];

    return (
        <head>
            {urls.flatMap((url) => [
                <link
                    key={`preconnect-${url}`}
                    rel="preconnect"
                    href={url}
                    crossOrigin="anonymous"
                />,
                <link
                    key={`dns-prefetch-${url}`}
                    rel="dns-prefetch"
                    href={url}
                />,
            ])}

            <script
                id="theme-script"
                dangerouslySetInnerHTML={{
                    __html:
                        "(function(){try{var k='payload-theme';var t=localStorage.getItem(k);var next=(t==='dark'||t==='light')?t:'light';document.documentElement.setAttribute('data-theme',next);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();",
                }}
            />
        </head>
    );
}