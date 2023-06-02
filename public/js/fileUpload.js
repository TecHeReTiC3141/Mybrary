const rootStyles = window.getComputedStyle(document.documentElement);

if (rootStyles.getPropertyValue('--book-cover-width-large')) {
    setPonds()
} else {
    document.getElementById('main-css')
        .addEventListener('load', setPonds);
}


function setPonds() {
    const coverWidth = parseFloat(
        rootStyles.getPropertyValue('--book-cover-width-large'));
    const aspectRatio = parseFloat(rootStyles.getPropertyValue('--book-cover-aspect-ratio'));
    const coverHeight = coverWidth / aspectRatio;
    console.log(coverWidth, aspectRatio, coverHeight);
    FilePond.registerPlugin(
        FilePondPluginImageResize,
        FilePondPluginImagePreview,
        FilePondPluginFileEncode,
    );

    FilePond.setOptions({
        stylePanelAspectRatio: 1 / aspectRatio,
        imageResizeTargetWidth: coverWidth,
        imageResizeTargetHeight: coverHeight,
    })
    FilePond.parse(document.body);
}
