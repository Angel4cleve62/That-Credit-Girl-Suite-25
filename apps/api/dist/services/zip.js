import AdmZip from 'adm-zip';
export function createZip(files) {
    const zip = new AdmZip();
    for (const file of files) {
        zip.addFile(file.pathInZip, file.content);
    }
    return zip.toBuffer();
}
