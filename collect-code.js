import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { relative, resolve } from 'path';

function getAllFiles(dir, files = []) {
    const dirents = readdirSync(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (
            dirent.isDirectory() &&
            !res.includes('node_modules') &&
            !res.includes('.next') &&
            !res.includes('.git') &&
            !res.includes('.vscode') &&
            !res.includes('.idea')
        ) {
            getAllFiles(res, files);
        } else if (
            dirent.isFile() &&
            (res.endsWith('.ts') || res.endsWith('.tsx')) &&
            !res.endsWith('.d.ts')
        ) {
            files.push(res);
        }
    }
    return files;
}

// Функция для генерации структуры проекта в стиле tree
function generateTreeStructure(dir = '.', prefix = '', isLast = true) {
    const dirents = readdirSync(dir, { withFileTypes: true });
    // Фильтруем ненужные директории
    const filteredDirents = dirents.filter((dirent) => {
        const fullPath = resolve(dir, dirent.name);
        return (
            !fullPath.includes('node_modules') &&
            !fullPath.includes('.next') &&
            !fullPath.includes('.git') &&
            !fullPath.includes('.vscode') &&
            !fullPath.includes('.idea')
        );
    });

    let result = '';

    filteredDirents.forEach((dirent, index) => {
        const isLastItem = index === filteredDirents.length - 1;
        const connector = isLastItem ? '└── ' : '├── ';
        const newPrefix = prefix + (isLast ? '    ' : '│   ');

        result += prefix + connector + dirent.name + '\n';

        if (dirent.isDirectory()) {
            const subDir = resolve(dir, dirent.name);
            result += generateTreeStructure(subDir, newPrefix, isLastItem);
        }
    });

    return result;
}

// Сортируем файлы для лучшей читаемости
const files = getAllFiles('.').sort();
let output = '';

console.log(`Найдено файлов: ${files.length}`);

files.forEach((file, index) => {
    try {
        const content = readFileSync(file, 'utf8');
        output += `\n\n===== ${file} =====\n\n${content}`;
        console.log(`Обработан файл ${index + 1}/${files.length}: ${file}`);
    } catch (err) {
        console.log(`Ошибка чтения файла: ${file}`, err.message);
    }
});

// Добавляем структуру проекта в конец файла
output += `\n\n===== СТРУКТУРА ПРОЕКТА =====\n\n`;
output += '.\n';
output += generateTreeStructure('.');

// Проверяем существует ли файл и удаляем его перед записью
const outputFile = 'full_code.txt';
if (existsSync(outputFile)) {
    console.log(`Файл ${outputFile} существует, будет перезаписан`);
}

writeFileSync(outputFile, output);
console.log(`Код собран в файл: ${outputFile}`);
