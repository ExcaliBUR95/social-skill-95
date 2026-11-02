# Instagram Growth — скилл для Claude

Превращает Claude в SMM-стратега по Instagram. Пишешь «сделай сценарий для рилс про мой кофе-бар» или «контент-план на неделю», и Claude сам применяет проверенные фреймворки: хуки на первые 3 секунды, структуру Reels, контент-рубрики и сигналы алгоритма. Сначала он задаёт нужные вопросы про цель, аудиторию и тон, а не выдаёт шаблонную воду.

## Что умеет

- **Сценарии Reels** по секундам: визуальный хук, удержание, CTA, правила монтажа и субтитров
- **Хуки** для Reels, каруселей и первой строки подписи
- **Карусели и подписи**, рассчитанные на сохранения и комментарии
- **Контент-план** на неделю с рубриками и схемой «отснять всё за один подход»
- **Разбор алгоритма**: что реально двигает охваты (досмотры, репосты, сохранения), а что почти не влияет
- **Аналитика**: какие метрики смотреть и что делать, если охваты падают или подписки не растут
- **Безопасная автоматизация**: отложенный постинг, автоответы в директ, аналитика. Никаких ботов массфолловинга и накрутки, которые режут охваты и ведут к бану

Работает на русском и английском: отвечает на языке запроса.

## Установка

### Claude.ai и приложение Claude (веб, десктоп)

1. Скачай [`instagram-growth.zip`](https://github.com/ExcaliBUR95/social-skill-95/raw/main/instagram-growth.zip)
2. Открой **Customize → Skills**, нажми **+** → **Create skill** → **Upload a skill**
3. Загрузи zip, распаковывать не нужно, и включи скилл переключателем

> Для работы скиллов должно быть включено выполнение кода: **Settings → Capabilities → Create and edit files**. На тарифах Team и Enterprise это настраивает администратор организации.

### Claude Code

Установка через плагин-маркетплейс (обновляется автоматически):

```
/plugin marketplace add ExcaliBUR95/social-skill-95
/plugin install instagram-growth@social-skill-95
```

Или вручную: скопируй папку `skills/instagram-growth` в `~/.claude/skills/`.

## Как пользоваться

Ничего вызывать не нужно: просто пиши про Instagram, и Claude подхватит скилл сам. Примеры:

- «Напиши 3 сценария рилс для салона маникюра, аудитория — девушки 25–35»
- «Сделай карусель из 7 слайдов: 5 ошибок новичков в фитнесе»
- «Почему мои рилсы набирают 300 просмотров? Вот последние 5 хуков: …»
- «Контент-план на неделю для онлайн-школы английского»

## Структура

```
skills/instagram-growth/SKILL.md   — сам скилл
.claude-plugin/marketplace.json    — каталог для установки в Claude Code
instagram-growth.zip               — архив для загрузки в Claude.ai
```

---

# Instagram Reel Video — готовый рилс целиком от Claude

Второй скилл в этом репозитории. Пишешь «сделай рилс про мой скилл с озвучкой», и Claude сам собирает готовое видео 1080×1920 в MP4: сценарий, голос, анимацию, звук и рендер. Без сторонних редакторов, платных сервисов озвучки и стоковых звуков. Хорошо работает в паре с `instagram-growth`: тот пишет сценарий, этот превращает его в видео.

## Что умеет

- **Видео как код** на [Remotion](https://www.remotion.dev): кинетический текст появляется слово в слово под голос, выделения, наезды камеры, тряска на ударах
- **Живая озвучка офлайн** через [Piper](https://github.com/rhasspy/piper): короткие фразы со своим темпом и паузами, обработка голоса (EQ, компрессия, громкость)
- **Все звуки синтезируются кодом**: костёр, сверчки, ветер, кваканье, «вжух», клики. Никаких чужих сэмплов и лицензий на них
- **Персонажи**: ИИ-аватар сидит спиной у костра и жестикулирует под речь, жаба на превью квакает и исчезает
- **Психология удержания**: превью с первого кадра, перебив шаблона, открытая петля «3 фишки», трекер прогресса, страх потери, «докажи делом» («это видео сделал Claude»), призыв «пиши слово в комментариях»
- **Самопроверка**: Claude рендерит ключевые кадры, проверяет переполнение текста, безопасные зоны Instagram и громкость перед финальным рендером

## Установка

### Claude.ai и приложение Claude

1. Скачай [`instagram-reel-video.zip`](https://github.com/ExcaliBUR95/social-skill-95/raw/main/instagram-reel-video.zip)
2. **Customize → Skills → + → Create skill → Upload a skill**, загрузи zip и включи скилл

> Рендер видео требует Node.js, поэтому полностью скилл раскрывается в **Claude Code** на своём компьютере. В Claude.ai он поможет со сценарием и кодом сцен.

### Claude Code

```
/plugin marketplace add ExcaliBUR95/social-skill-95
/plugin install instagram-reel-video@social-skill-95
```

Или вручную: скопируй папку `skills/instagram-reel-video` в `~/.claude/skills/`.

### Что понадобится (всё бесплатно, с официальных сайтов)

- [Node.js](https://nodejs.org) 20+
- [Piper](https://github.com/rhasspy/piper/releases) и русский голос `denis` из [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices/tree/main/ru/ru_RU/denis/medium). Лицензия голоса CC0, им можно озвучивать и коммерческие ролики. Голос `ruslan` — только некоммерческое использование (CC BY-NC-SA)
- [ffmpeg](https://ffmpeg.org/download.html) — по желанию, для обработки голоса
- Remotion бесплатен для частных лиц и команд до 3 человек, крупным компаниям нужна [лицензия](https://www.remotion.dev/license)

Claude сам подскажет, что и куда поставить.

## Как пользоваться

- «Сделай рилс на 30 секунд про мой скилл, автор @мой.ник, призыв — пиши "хочу" в комментариях»
- «Переозвучь сцену 2 быстрее и добавь паузу перед "третья"»
- «Замени жабу на кота и сделай фон дневным»

## Структура

```
skills/instagram-reel-video/SKILL.md    — сам скилл
skills/instagram-reel-video/template/   — рабочий пример ролика «у костра» (Remotion-проект)
  scripts/generate-voiceover.mjs        — озвучка через Piper + тайминги слов
  scripts/generate-sfx.mjs              — синтез всех звуков и эмбиента
  src/Campfire/                         — сцены, аватар, жаба, костёр
instagram-reel-video.zip                — архив для загрузки в Claude.ai
```

---

**English:** an Instagram growth skill for Claude covering Reels scripts, hooks, carousels, captions, content calendars, analytics and safe automation. Install it in Claude.ai by uploading [`instagram-growth.zip`](https://github.com/ExcaliBUR95/social-skill-95/raw/main/instagram-growth.zip) in Customize → Skills. In Claude Code, run `/plugin marketplace add ExcaliBUR95/social-skill-95`, then `/plugin install instagram-growth@social-skill-95`.

The second skill, **instagram-reel-video**, has Claude produce a finished 1080×1920 reel end to end: Remotion animation synced word by word to an offline Piper voiceover, all sound effects and ambience synthesized in code, and built-in retention techniques. Install it with [`instagram-reel-video.zip`](https://github.com/ExcaliBUR95/social-skill-95/raw/main/instagram-reel-video.zip) or `/plugin install instagram-reel-video@social-skill-95`.
