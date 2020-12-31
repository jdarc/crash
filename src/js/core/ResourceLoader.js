export const loadImage = (src, callback, options) => {
    const img = new Image();
    img.onload = () => callback(img, options);
    img.src = src;
    return img;
};

export default function(rootResourcePath) {
    const workload = [];
    const resources = [];

    return {
        add(key, url) {
            workload.push({ key: key, url: url });
        },
        load(callback) {
            const counter = new Int32Array(2);
            counter[1] = workload.length;
            let i = 0;
            const len = workload.length;
            for (; i < len; ++i) {
                const req = new XMLHttpRequest();
                req.resourceKey = workload[i].key;
                req.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        resources[this.resourceKey] = this.responseText;
                        if (++counter[0] >= counter[1]) {
                            callback(resources);
                        }
                    }
                };
                req.open("GET", rootResourcePath + "/" + workload[i].url, true);
                req.send(null);
            }
        }
    }
}
