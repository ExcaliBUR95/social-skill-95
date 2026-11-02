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

**English:** an Instagram growth skill for Claude covering Reels scripts, hooks, carousels, captions, content calendars, analytics and safe automation. Install it in Claude.ai by uploading [`instagram-growth.zip`](https://github.com/ExcaliBUR95/social-skill-95/raw/main/instagram-growth.zip) in Customize → Skills. In Claude Code, run `/plugin marketplace add ExcaliBUR95/social-skill-95`, then `/plugin install instagram-growth@social-skill-95`.
