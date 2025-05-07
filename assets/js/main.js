
    let fileMap = {};
    let allGeneratedTags = {};
    let expandedPaths = new Set();

    document.getElementById("folderInput").addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        fileMap = {};
        allGeneratedTags = {};
        expandedPaths.clear();

        files.forEach(file => {
            const parts = file.webkitRelativePath.split("/");
            let current = fileMap;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (i === parts.length - 1) {
                    current[part] = file;
                    const fullPath = file.webkitRelativePath;
                    allGeneratedTags[fullPath] = generateTag(fullPath);
                } else {
                    current[part] = current[part] || {};
                    current = current[part];
                }
            }
        });

        document.getElementById("treeView").style.display = 'block';
        renderTree();
    });

    function renderTree() {
        document.getElementById("treeView").innerHTML = buildTreeHTML(fileMap);
    }

    function buildTreeHTML(obj, path = '') {
        let html = '<ul>';
        for (const key in obj) {
            const fullPath = path ? `${path}/${key}` : key;
            if (obj[key] instanceof File) {
                html += `<li class="file" onclick="showFileTag('${fullPath.replace(/'/g, "\\'")}')">📄 ${key}</li>`;
            } else {
                const expanded = expandedPaths.has(fullPath) ? 'expanded' : '';
                html +=
                    `<li class="folder ${expanded}" onclick="toggleFolder(event, '${fullPath.replace(/'/g, "\\'")}')" ondblclick="showFolderTags('${fullPath.replace(/'/g, "\\'")}')">📁 ${key}<div class="children">${buildTreeHTML(obj[key], fullPath)}</div></li>`;
            }
        }
        html += '</ul>';
        return html;
    }

    function toggleFolder(event, path) {
        event.stopPropagation();
        if (expandedPaths.has(path)) {
            expandedPaths.delete(path);
        } else {
            expandedPaths.add(path);
        }
        renderTree();
    }

    function generateTag(path) {
        const ext = path.split('.').pop().toLowerCase();
        if (ext === 'css' || ext === 'scss') return '<link rel="stylesheet" href="' + path + '">';
        if (ext === 'js') return '<script src="' + path + '"><\/script>';
        if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return '<img src="' + path + '" alt="">';
        if (["mp4", "webm", "ogg"].includes(ext)) return '<video controls><source src="' + path + '" type="video/' +
            ext + '"></video>';
        return '';
    }

    function showFileTag(path) {
        document.getElementById("outputBox").style.display = "block";
        document.getElementById("outputBox").innerText = allGeneratedTags[path] || "No tag available";
    }

    function showFolderTags(folderPath) {
        let grouped = {
            css: [],
            js: [],
            scss: [],
            img: [],
            video: [],
            other: []
        };
        const map = {
            css: ['css'],
            js: ['js'],
            scss: ['scss'],
            img: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'],
            video: ['mp4', 'webm', 'ogg']
        };
        const paths = Object.keys(allGeneratedTags).filter(key => key.startsWith(folderPath + '/'));

        paths.forEach(key => {
            const ext = key.split('.').pop().toLowerCase();
            let found = false;
            for (let cat in map) {
                if (map[cat].includes(ext)) {
                    grouped[cat].push(allGeneratedTags[key]);
                    found = true;
                    break;
                }
            }
            if (!found) grouped.other.push(allGeneratedTags[key]);
        });

        let combined = '';
        for (let cat in grouped) {
            const tags = grouped[cat];
            if (tags.length > 0) {
                combined += `\n<!-- ${cat.toUpperCase()} TAGS (${tags.length}) -->\n`;
                tags.forEach((tag, idx) => {
                    combined += `${idx + 1}. ${tag}\n-----------------------------\n`;
                });
                combined += `<br>\n`;
            }
        }

        document.getElementById("outputBox").style.display = "block";
        document.getElementById("outputBox").innerText = combined.trim() || 'No tags in this folder.';
    }

    function toggleTree() {
        const el = document.getElementById("treeView");
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }

    function filterFiles(type) {
        const categories = {
            css: ['css'],
            js: ['js'],
            scss: ['scss'],
            img: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'],
            video: ['mp4', 'webm', 'ogg']
        };

        let grouped = {
            css: [],
            js: [],
            scss: [],
            img: [],
            video: [],
            other: []
        };

        for (const path in allGeneratedTags) {
            const ext = path.split('.').pop().toLowerCase();
            let found = false;
            for (let cat in categories) {
                if (type !== 'all' && cat !== type) continue;
                if (categories[cat].includes(ext)) {
                    grouped[cat].push(allGeneratedTags[path]);
                    found = true;
                    break;
                }
            }
            if ((type === 'all') && !found) {
                grouped.other.push(allGeneratedTags[path]);
            }
        }

        let output = '';
        for (let cat in grouped) {
            const tags = grouped[cat];
            if (tags.length > 0) {
                output += `\n<!-- ${cat.toUpperCase()} TAGS (${tags.length}) -->\n`;
                tags.forEach((tag, idx) => {
                    output += `${idx + 1}. ${tag}\n-----------------------------\n`;
                });
                output += `<br>\n`;
            }
        }

        document.getElementById("outputBox").style.display = "block";
        document.getElementById("outputBox").innerText = output.trim() || 'No tags found.';
    }

    function copyToClipboard() {
        const text = document.getElementById("outputBox").innerText;
        if (!text.trim()) return alert("Nothing to copy!");
        navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
    }
    
