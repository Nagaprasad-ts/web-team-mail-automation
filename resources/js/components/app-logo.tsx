export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm dark:bg-white/10">
                <img
                    src="/nhei-favicon.ico"
                    alt="NHEI"
                    className="size-7 object-contain"
                />
            </div>
            <div className="ml-1.5 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold tracking-wide">
                    NHEI
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    Web Team Console
                </span>
            </div>
        </>
    );
}
