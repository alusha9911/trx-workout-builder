/* Данные и логика конструктора тренировок. Язык: LANG ('ru' | 'uk' | 'fr' | 'en') */
var LANG = 'ru';
function tr(key, vars) {
  var d = I18N[LANG] && I18N[LANG][key];
  if (d == null) d = I18N.ru[key];
  if (d == null) return key;
  if (vars) d = d.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : ''; });
  return d;
}
function withLang(lang, fn) { var o = LANG; LANG = lang; try { return fn(); } finally { LANG = o; } }
function labelMap(prefix, keys) {
  var o = {};
  keys.forEach(function (k) { Object.defineProperty(o, k, { enumerable: true, get: function () { return tr(prefix + k); } }); });
  return o;
}
var EQ_LABELS = labelMap('eq.', ['t', 'd', 'r', 'b']);
var PAT_LABELS = labelMap('pat.', ['squat', 'lunge', 'hinge', 'glute', 'push', 'pull', 'shoulder', 'arm', 'core', 'cardio', 'warm', 'cool', 'pf']);
var CONTRA_LABELS = labelMap('co.', ['k', 's', 'w', 'l', 'n', 'p']);
var CONTRA_SHORT = labelMap('cs.', ['k', 's', 'w', 'l', 'n', 'p']);
var UNIT_LABELS = labelMap('un.', ['r', 'u', 't', 's']);
var LEVELS = labelMap('lvl.', ['1', '2', '3']);
var GOALS = {
  tone:     { sets: 3, lo: 12, hi: 15, rest: 45 },
  fat:      { sets: 3, lo: 12, hi: 15, rest: 40, cardio: true },
  muscle:   { sets: 4, lo: 8, hi: 12, rest: 75 },
  strength: { sets: 4, lo: 5, hi: 8, rest: 90 },
  glutes:   { sets: 3, lo: 12, hi: 15, rest: 45 },
  posture:  { sets: 3, lo: 12, hi: 15, rest: 45 },
  health:   { sets: 3, lo: 10, hi: 12, rest: 60 }
};
Object.keys(GOALS).forEach(function (k) {
  Object.defineProperty(GOALS[k], 'label', { get: function () { return tr('goal.' + k); } });
  Object.defineProperty(GOALS[k], 'tip', { get: function () { return tr('tip.' + k); } });
});
var TEMPLATES = {
  L: { slots: ['squat', 'hinge', 'lunge', 'glute', 'squat', 'glute'] },
  U: { slots: ['push', 'pull', 'shoulder', 'pull', 'push', 'arm'] },
  F: { slots: ['squat', 'push', 'hinge', 'pull', 'glute', 'shoulder'] },
  G: { slots: ['glute', 'hinge', 'squat', 'glute', 'lunge', 'glute'] },
  P: { slots: ['pull', 'hinge', 'pull', 'shoulder', 'glute', 'push'] }
};
Object.keys(TEMPLATES).forEach(function (k) {
  Object.defineProperty(TEMPLATES[k], 'title', { get: function () { return tr('tpl.' + k); } });
});

var RAW = [
// squat
'Приседания с собственным весом||squat|1|r|',
'Приседания с паузой внизу||squat|2|r|k',
'Приседания с узкой постановкой ног||squat|2|r|k',
'Присед у стены (статика)||squat|1|t|k',
'Приседания в TRX с опорой|t|squat|1|r|',
'Присед сумо в TRX с опорой|t|squat|1|r|',
'Приседания на одной ноге в TRX|t|squat|3|u|k',
'Болгарский сплит-присед с ногой в петле TRX|t|squat|3|u|k',
'Кубковый присед с гантелью|d|squat|1|r|',
'Кубковый присед с медленным опусканием|d|squat|3|r|k',
'Присед с гантелями у плеч|d|squat|2|r|',
'Присед сумо с гантелью|d|squat|1|r|',
'Присед с резинкой над коленями|r|squat|1|r|',
'Присед сумо с резинкой над коленями|r|squat|1|r|',
// lunge
'Выпады назад на месте||lunge|1|u|',
'Выпады вперед на месте||lunge|2|u|k',
'Боковые выпады||lunge|2|u|k',
'Реверанс (выпад назад по диагонали)||lunge|2|u|',
'Сплит-присед (статичный выпад)||lunge|1|u|',
'Шаги на возвышение (ступенька или устойчивый стул)||lunge|1|u|',
'Выпады назад с гантелями|d|lunge|2|u|',
'Ходьба выпадами с гантелями|d|lunge|3|u|k',
'Кубковый боковой выпад с гантелью|d|lunge|2|u|k',
'Сплит-присед с опорой в TRX|t|lunge|1|u|',
'Выпад назад с ногой в петле TRX|t|lunge|2|u|k',
'Боковой выпад с опорой в TRX|t|lunge|2|u|k',
'Выпады назад с резинкой над коленями|r|lunge|2|u|',
// hinge
'Наклоны с прямой спиной без веса (хип-хинж)||hinge|1|r|l',
'Румынская тяга на одной ноге с опорой рукой||hinge|2|u|',
'Скольжение пяток лежа (мостик, носки на полу)||hinge|2|r|',
'Румынская тяга с гантелями|d|hinge|1|r|l',
'Румынская тяга на одной ноге с гантелью|d|hinge|3|u|l',
'Тяга сумо с гантелью|d|hinge|1|r|l',
'Румынская тяга с резинкой под стопами|r|hinge|1|r|l',
'Гуд-морнинг с резинкой|r|hinge|2|r|l',
'Хип-хинж с опорой в TRX|t|hinge|1|r|',
'Хип-хинж на одной ноге в TRX|t|hinge|2|u|',
'Сгибание ног в TRX лежа (мостик с подтягиванием пяток)|t|hinge|3|r|',
// glute
'Ягодичный мостик||glute|1|r|',
'Ягодичный мостик с паузой наверху||glute|2|r|',
'Ягодичный мостик на одной ноге||glute|2|u|',
'Отведение ноги назад на четвереньках||glute|1|u|w',
'Пожарный гидрант||glute|1|u|w',
'Отведение ноги лежа на боку||glute|1|u|',
'Клэмшелл (ракушка)||glute|1|u|',
'Ягодичный мостик с резинкой над коленями|r|glute|1|r|',
'Ягодичный мостик на одной ноге с резинкой|r|glute|2|u|',
'Отведение ноги назад на четвереньках с резинкой|r|glute|1|u|w',
'Пожарный гидрант с резинкой|r|glute|1|u|w',
'Отведение ноги лежа на боку с резинкой|r|glute|1|u|',
'Клэмшелл с резинкой|r|glute|1|u|',
'Боковая ходьба с резинкой над коленями|r|glute|1|r|',
'Ходьба «монстр» с резинкой|r|glute|2|r|',
'Отведение ноги назад стоя с резинкой|r|glute|1|u|',
'Ягодичный мостик с гантелью на тазу|d|glute|2|r|',
'Ягодичный мостик со стопами в петлях TRX|t|glute|2|r|',
'Ягодичный мостик в TRX на одной ноге|t|glute|3|u|',
'Отведение ноги назад стоя в TRX|t|glute|1|u|',
'Отведение ноги в сторону стоя в TRX|t|glute|1|u|',
// push
'Отжимания от стены||push|1|r|',
'Отжимания с наклоном (руки на устойчивой опоре)||push|1|r|w s',
'Отжимания от колен||push|1|r|w s',
'Классические отжимания||push|2|r|w s p',
'Отжимания с узкой постановкой рук||push|2|r|w s',
'Отжимания с широкой постановкой рук||push|2|r|w s',
'Отжимания «алмаз»||push|3|r|w s',
'Отжимания с резинкой на спине|r|push|3|r|w s',
'Жим от груди с резинкой|r|push|1|r|s',
'Жим гантелей лежа на полу|d|push|1|r|s',
'Разводка гантелей лежа на полу|d|push|1|r|s',
'Пуловер с гантелью лежа на полу|d|push|2|r|s',
'Отжимания в TRX|t|push|2|r|s',
'Разводка рук в TRX (грудь)|t|push|2|r|s',
// shoulder
'Подъем рук лежа на животе (Y-T-W)||shoulder|1|r|',
'Пайк-отжимания||shoulder|3|r|w s n',
'Жим гантелей стоя|d|shoulder|1|r|s n',
'Жим гантелей Арнольда|d|shoulder|2|r|s',
'Подъем гантелей в стороны|d|shoulder|1|r|s',
'Подъем гантелей перед собой|d|shoulder|1|r|s',
'Подъем гантелей в наклоне (задняя дельта)|d|shoulder|1|r|l',
'Разведение рук в стороны с резинкой|r|shoulder|1|r|s',
'Жим резинки над головой|r|shoulder|1|r|s',
'Y-подъем в TRX|t|shoulder|2|r|s',
'T-подъем в TRX (разведение в стороны)|t|shoulder|2|r|s',
// pull
'Лодочка (подъем корпуса лежа на животе)||pull|1|r|l',
'Плавание лежа на животе||pull|1|t|l',
'Тяга в TRX (гребля)|t|pull|1|r|',
'Тяга в TRX с широким хватом|t|pull|2|r|',
'Тяга в TRX одной рукой|t|pull|3|u|',
'Лицевая тяга в TRX|t|pull|1|r|',
'Тяга гантели в наклоне одной рукой с опорой|d|pull|1|u|',
'Тяга двух гантелей в наклоне|d|pull|2|r|l',
'Тяга гантелей лежа на животе|d|pull|1|r|l',
'Тяга резинки сидя к поясу|r|pull|1|r|',
'Тяга резинки сверху вниз (имитация подтягиваний)|r|pull|1|r|',
'Лицевая тяга с резинкой|r|pull|1|r|',
'Разведение резинки перед собой (pull-apart)|r|pull|1|r|',
// arm
'Обратные отжимания от опоры||arm|2|r|s w',
'Отжимания узким хватом||arm|2|r|w s',
'Сгибание рук с гантелями на бицепс|d|arm|1|r|',
'Сгибание рук «молот»|d|arm|1|r|',
'Французский жим гантели из-за головы|d|arm|1|r|s',
'Разгибание руки назад с гантелью в наклоне|d|arm|1|u|l',
'Сгибание рук с резинкой|r|arm|1|r|',
'Разгибание рук с резинкой вниз|r|arm|1|r|',
'Сгибание рук в TRX|t|arm|1|r|',
'Разгибание рук в TRX (трицепс)|t|arm|2|r|s',
// core
'Планка на предплечьях||core|1|t|p',
'Планка на коленях||core|1|t|',
'Боковая планка||core|2|s|s',
'Боковая планка с колена||core|1|s|',
'Мертвый жук||core|1|u|',
'Птица-собака||core|1|u|w',
'Скручивания||core|1|r|p n l',
'Обратные скручивания||core|2|r|p',
'Подъем ног лежа||core|2|r|p l',
'Погоны (планка с касанием плеч руками)||core|2|r|w s p',
'Полая позиция (hollow hold)||core|3|t|p l',
'Тяга колена к локтю стоя||core|1|u|',
'Русские скручивания с гантелью|d|core|2|r|p l',
'Дровосек с гантелью|d|core|2|u|p',
'Боковые наклоны с гантелью|d|core|1|u|l',
'Антиротация Паллоф с резинкой|r|core|1|u|',
'Дровосек с резинкой|r|core|1|u|',
'Планка в TRX (стопы в петлях)|t|core|3|t|s p w',
'Пила в TRX|t|core|3|r|s p',
'Скалолаз в TRX|t|core|3|r|s w p',
'Подтягивание коленей к груди в TRX|t|core|2|r|p w',
// cardio
'Ходьба с высоким подъемом колен (низкая ударность)||cardio|1|t|',
'Шаги в стороны с махами рук (без прыжков)||cardio|1|t|',
'Шэдоу-бокс (удары в воздух)||cardio|1|t|',
'Бег на месте с высоким подъемом колен||cardio|1|t|p',
'Прыжки «джек»||cardio|1|t|k p',
'Скалолаз||cardio|2|t|w s p',
'Берпи без отжимания||cardio|2|t|k w p',
'Приседания с выпрыгиванием||cardio|2|t|k p',
'Лыжник (прыжки в стороны)||cardio|2|t|k p',
'Берпи||cardio|3|t|k w s p',
'Трастеры с гантелями|d|cardio|2|t|k s p',
// warm
'Круги плечами||warm|1|r|',
'Кошка-корова||warm|1|r|w',
'Круги тазом стоя||warm|1|r|',
'Раскрытия грудного отдела лежа на боку||warm|1|u|',
'Мировая прогулка (выпад с поворотом)||warm|2|u|k',
'Активация ягодиц (мостик без нагрузки)||warm|1|r|',
'Махи ногой вперед и назад||warm|1|u|',
'Разминочный бег на месте||warm|1|t|',
'Мобилизация голеностопа||warm|1|u|',
'Ходьба руками вперед (inchworm)||warm|2|r|w',
'Вращения корпусом стоя||warm|1|r|l',
'Глубокий присед с опорой в TRX|t|warm|1|r|',
'Активация плеч с резинкой|r|warm|1|r|',
'Боковая ходьба с резинкой (активация)|r|warm|1|r|',
// cool
'Растяжка сгибателя бедра (выпад)||cool|1|s|',
'Растяжка задней поверхности бедра||cool|1|s|',
'Растяжка ягодицы («четверка»)||cool|1|s|',
'Растяжка квадрицепса стоя||cool|1|s|k',
'Поза ребенка||cool|1|t|k',
'Спинальный твист лежа||cool|1|s|',
'Растяжка трицепса||cool|1|s|s',
'Растяжка приводящих мышц (бабочка)||cool|1|t|',
'Растяжка груди у стены||cool|1|s|s',
'Дыхание животом лежа (расслабление)||cool|1|t|',
'Растяжка груди в TRX|t|cool|1|t|s',
'Растяжка спины в TRX (вис с отклонением назад)|t|cool|1|t|',
// pf
'Диафрагмальное дыхание с расслаблением тазового дна||pf|1|t|',
'Сокращения мышц тазового дна лежа (кегель)||pf|1|r|',
'Мостик с выдохом и подъемом тазового дна||pf|1|r|',
'Сведение колен с подушкой лежа||pf|1|r|',
'Дыхательный присед с выдохом||pf|1|r|',
'Мертвый жук с выдохом (низкое давление)||pf|1|u|',
'Поза счастливого ребенка (расслабление)||pf|1|t|',
'Кошка-корова с дыханием||pf|1|r|w',
// exercises from real client sessions
'Глубокий присед со статикой||squat|1|t|k',
'Присед на носках, спиной к точке крепления, с выпрыгиванием вперед|t|squat|3|r|k p',
'Присед с чередованием колен к середине (широкая постановка)||squat|2|r|k',
'Приседания на носочках с узкой постановкой||squat|2|r|k',
'Широкий присед с перекатами на носки||squat|1|r|',
'Глубокий присед с подъемами на икры||squat|1|r|',
'Присед на одной ноге, вторая лодыжка на колене||squat|2|u|k',
'Присед на одной ноге с задним выпадом (чередование)||squat|3|u|k',
'Задние приседания спиной к точке крепления (стропы под мышками)|t|squat|1|r|',
'Присед в наклоне назад с подтягиванием к стропам|t|squat|2|r|',
'Присед на пятках лицом к точке крепления с наклоном и подтягиванием|t|squat|2|u|',
'Глубокий боковой выпад||lunge|2|u|k',
'Статический выпад с пружиной||lunge|2|u|k',
'Выпад назад с махом другой ноги вверх||lunge|2|u|',
'Выпад назад накрест с подъемом колена к груди||lunge|2|u|',
'Выпад вперед спиной к точке крепления, руки вверх|t|lunge|2|u|k',
'Выпад назад с ногой в петле и подъемом колена|t|lunge|2|u|k',
'Боковой выпад с ногой в петле и наклоном|t|lunge|2|u|k',
'Выпад ногой в петле вперед по растяжке|t|lunge|2|u|k',
'Широкий выпад в сторону с подъемом ноги||lunge|2|u|k',
'Широкая стойка: выпад в сторону и выпад на колено по очереди||lunge|3|u|k',
'Румынская тяга у стены на каждую ногу||hinge|1|u|',
'Румынская тяга на одной ноге с гантелью, рука держит петлю TRX|td|hinge|2|u|l',
'Румынская тяга с разворотом корпуса|d|hinge|2|r|l',
'Наклон вперед на коленях со стропами (бедра вперед)|t|hinge|2|r|k',
'Ягодичный мостик на одной ноге, вторая нога на колене||glute|2|u|',
'Ягодичный мостик с разведением коленей||glute|1|r|',
'Ягодичный мостик с прямыми ногами и разведением||glute|2|r|',
'Обратная планка: подъем и опускание таза||glute|1|r|w s',
'Ягодичный мостик в TRX на одной ноге, вторая нога на колене|t|glute|2|u|',
'Мостик в TRX: ноги согнуты 90°, разведение коленей|t|glute|2|r|',
'Высокий мостик в TRX с поочередным сгибанием коленей|t|glute|3|u|',
'Мостик в TRX с подтягиванием себя руками к стропам|t|glute|2|r|',
'Мостик на одной ноге в TRX с толчком второй ногой вверх|t|glute|3|u|',
'Крабик: боковые шаги в приседе||glute|1|r|',
'Крабик с пружиной на последнем шаге||glute|2|r|',
'Присед с махом прямой ногой в сторону||glute|1|u|',
'Мах в сторону и выпад на опорной ноге||glute|2|u|',
'Мах коленом к груди и отведение ноги назад||glute|1|u|',
'Махи ногами вверх и в стороны с четверенек||glute|1|u|w',
'Отжимания в TRX с колен|t|push|1|r|s',
'Отжимания в TRX спиной к точке крепления (стропы под мышками)|t|push|2|r|s',
'Отжимания в TRX: руки в петлях по локоть, грудью вперед|t|push|2|r|s',
'Отжимания одной рукой, спиной к точке, вторая рука прямая|t|push|3|u|s',
'Разводка в TRX на предплечьях, грудь проваливается вперед|t|push|2|r|s',
'Открывание груди на предплечьях в TRX (проваливаемся вперед)|t|push|1|r|s',
'Отжимания «в воздухе» в TRX|t|push|3|r|s w',
'Отжимания из положения упор лежа, шаги руками||push|2|r|w s',
'Отжимания с поворотом (одна рука уходит в сторону)||push|3|u|w s',
'W-разводка в TRX лицом к точке крепления|t|shoulder|1|r|s',
'Высокая W-разводка в TRX|t|shoulder|2|r|s',
'Круг прямыми руками в TRX (крокодил)|t|shoulder|2|r|s',
'Полукруг прямыми руками в TRX лицом к точке крепления|t|shoulder|2|r|s',
'Руки под 90° и разведение в стороны в TRX, спиной к точке|t|shoulder|2|r|s',
'Прямые руки в стороны в TRX, чередуем|t|shoulder|2|r|s',
'Ангелочек у стены (осанка)||shoulder|1|r|',
'Присед и ангел для осанки||shoulder|1|r|',
'Подтягивания в TRX на уровне груди, локти на уровне плеч|t|pull|2|r|',
'Тяга в TRX боком к точке крепления одной рукой|t|pull|2|u|',
'Тяга одной рукой вдоль ребер, вторая за спиной|t|pull|2|u|',
'Тяга лицом к TRX с разведением рук в стороны|t|pull|2|r|',
'Скрестная тяга «объятия» в TRX под углом|t|pull|2|r|',
'Подтягивание в TRX лежа на спине под высокими стропами|t|pull|2|r|',
'Подтягивание в TRX сидя на полу к высоким стропам|t|pull|1|r|',
'Подтягивание в TRX в глубоком приседе, уши между рук|t|pull|2|r|',
'Подтягивание в TRX на одной руке из глубокого приседа|t|pull|3|u|',
'Подтягивание груди к стропам в обратной планке|t|pull|2|r|w s',
'Подтягивание в TRX руками вдоль тела, лицом к стропам|t|pull|1|r|',
'Подъем рук лежа на животе (угол 90°)||pull|1|r|l',
'Подъем прямых рук лежа на животе, большие пальцы вверх||pull|1|r|l',
'Большой круг руками лежа на животе, руки на поясницу||pull|1|r|l',
'Подъем лопаток лежа на животе, руки за головой||pull|1|r|l',
'Подъем лопаток лежа на животе, руки на пояснице||pull|1|r|l',
'Бицепс в TRX одной рукой|t|arm|2|u|',
'Бицепс в TRX на коленях в наклоне|t|arm|1|r|',
'Трицепс в TRX спиной к точке крепления|t|arm|1|r|s',
'Трицепс в TRX на коленях лицом к точке крепления|t|arm|1|r|s',
'Трицепс в TRX: кисти толкают тело вперед|t|arm|2|r|s',
'Выжимание себя на трицепс (стропы под мышками)|t|arm|2|r|s',
'Диагональные скручивания лежа||core|1|u|p n',
'Подъем таза с прямыми ногами вверх||core|2|r|p l',
'Ножницы лежа||core|2|r|p l',
'Опускание пятки к полу, ноги 90°, поясница прижата||core|1|u|',
'Медвежонок (удержание на четвереньках, колени над полом)||core|2|t|w p',
'Касание щиколоток лежа (боковые скручивания)||core|1|r|p n',
'Боковая планка: бедро к полу и обратно||core|2|u|s',
'Планка: колено к плечу поочередно||core|2|r|w p',
'Шаги руками в планке||core|2|r|w',
'Высокая планка с пайком||core|2|r|w s',
'Переход из планки на предплечьях в планку на прямых руках||core|2|r|w',
'Планка на прямых руках, нога в сторону||core|2|u|w',
'Планка с касанием бедром пола||core|2|r|',
'Мертвый жук: обе ноги и обе руки вниз и обратно||core|2|r|',
'Мертвый жук с гантелью|d|core|2|u|',
'Велосипед лежа||core|1|u|p n',
'Лежа: тянемся к противоположной стопе||core|1|u|p',
'Сидя на ягодицах: ноги вперед-назад, одна согнута треугольником||core|2|u|p',
'Сидя на ягодицах: боковые скручивания с гантелью, ноги оторваны|d|core|3|u|p l',
'Обратная планка: мертвый жук поочередно||core|2|u|w s',
'Обратная планка: подъем ноги вверх||core|2|u|w s',
'Восьмерка ногами в воздухе лежа||core|2|r|p l',
'Лежа: руки к поднятым вверх ногам||core|1|r|p',
'Косые на колене со стропами вверху|t|core|2|u|',
'Боковой наклон на колене в TRX|t|core|1|u|',
'Планка в TRX: колени к груди|t|core|3|r|s w p',
'Планка в TRX: колено к плечу поочередно|t|core|3|u|s w p',
'Планка пайк в TRX с разведением ног|t|core|3|r|s w p',
'Пайк в TRX на локтях|t|core|3|r|s p',
'Боковая планка в TRX: колено к локтю|t|core|3|u|s p',
'Боковая планка в TRX: колени к груди|t|core|3|u|s p',
'Пятки в петлях: колени к груди с подъемом таза|t|core|2|r|p',
'Пятки в петлях: разведение ног лежа|t|core|2|r|p',
'Пятки в петлях: ротации коленей в стороны лежа|t|core|2|u|p',
'Пятки в петлях: тянемся к пятке поочередно|t|core|2|u|p',
'Сидя, ноги в петлях: боковые ротации с наклоном назад|t|core|3|u|p',
'Полная складка с ногами в петлях (колени к локтям)|t|core|3|r|p',
'Сидя с опорой на стропы: ножницы|t|core|2|r|p',
'Альтернатива берпи: упор лежа, отжимание, возврат||cardio|2|t|w s p',
'Прыжки спиной к креплению из обратного приседа|t|cardio|3|t|k p',
'Приседание-прыжок с чередованием широкой и узкой постановки||cardio|2|t|k p',
'Присед, опускание на колени и выпрыгивание||cardio|3|t|k p',
'Выпрыгивающие выпады с чередованием||cardio|2|t|k p',
'Присед-прыжок со скручиванием в сторону||cardio|2|t|k p',
'Планка: прыжки ногами в стороны и собака мордой вниз||cardio|2|t|w p',
'Бег на месте в наклоне, стропы под мышками|t|cardio|2|t|p',
'Растяжка: нога в петле, выпад вперед|t|cool|1|s|k'
];

function defaultExercises() {
  return RAW.map(function (line, i) {
    var p = line.split('|'), nm = NAMES_I18N[i] || [];
    return {
      id: 'd' + (i + 1), name: p[0], n_uk: nm[0] || '', n_fr: nm[1] || '', n_en: nm[2] || '',
      eq: p[1] ? p[1].split('') : [], pat: p[2],
      lvl: parseInt(p[3], 10), unit: p[4], contra: p[5] ? p[5].split(' ') : [], url: '', note: ''
    };
  });
}
function descIdx(e) { var m = /^d(\d+)$/.exec(e.id || ''); return m ? +m[1] - 1 : -1; }
function exPro(e) { if (e.pro) return e.pro; var i = descIdx(e); return i >= 0 && DESC_I18N[i] ? DESC_I18N[i][0] : ''; }
function exHow(e, lang) {
  lang = lang || LANG;
  if (e['how_' + lang]) return e['how_' + lang];
  var i = descIdx(e), k = { ru: 1, uk: 2, fr: 3, en: 4 }[lang];
  return i >= 0 && DESC_I18N[i] ? DESC_I18N[i][k] : '';
}
function exByItem(it, lib) { for (var i = 0; i < lib.length; i++) { if (lib[i].id === it.exId) return lib[i]; } return null; }
function exName(e) { return (LANG !== 'ru' && e['n_' + LANG]) || e.name; }
function itemName(it, lib) {
  for (var i = 0; i < lib.length; i++) { if (lib[i].id === it.exId) return exName(lib[i]); }
  return it.name;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isUni(e) { return e.unit === 'u' || e.unit === 's'; }
function shuffle(arr, rnd) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

function weekPlan(days, goal) {
  var base = { 1: 'F', 2: 'FF', 3: 'FFF', 4: 'LULU', 5: 'LUFLU' }[days];
  if (goal === 'muscle' || goal === 'strength') { if (days === 3) base = 'LUF'; }
  if (goal === 'glutes') base = { 1: 'G', 2: 'GF', 3: 'GUG', 4: 'GUGF', 5: 'GUGFG' }[days];
  if (goal === 'posture') base = { 1: 'P', 2: 'PF', 3: 'PFP', 4: 'PLPF', 5: 'PLPFU' }[days];
  return base.split('');
}

function eligible(lib, pat, ctx, exclude) {
  return lib.filter(function (e) {
    if (e.pat !== pat) return false;
    if (e.lvl > ctx.level) return false;
    if (!e.eq.every(function (q) { return ctx.equip.indexOf(q) >= 0; })) return false;
    if (e.contra.some(function (c) { return ctx.restr.indexOf(c) >= 0; })) return false;
    if (exclude && exclude.indexOf(e.id) >= 0) return false;
    return true;
  });
}

function pick(list, rnd, level, prefT, recent) {
  if (!list.length) return null;
  var ws = list.map(function (e) { var w = e.lvl === level ? 3 : (e.lvl === level - 1 ? 1.5 : 0.7); if (prefT && e.eq.indexOf('t') >= 0) w *= 2.5; if (recent && recent[e.id]) w *= recent[e.id] === 1 ? 0.04 : (recent[e.id] === 2 ? 0.15 : (recent[e.id] === 3 ? 0.35 : 0.65)); return w; });
  var sum = ws.reduce(function (a, b) { return a + b; }, 0);
  var r = rnd() * sum;
  for (var i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return list[i]; }
  return list[list.length - 1];
}

/* Назначение хранится структурой, текст строится на нужном языке в fmtRx */
function prescription(ex, role, goalKey, level) {
  var g = GOALS[goalKey], u = ex.unit, side = (u === 'u' || u === 's');
  if (role === 'warm') {
    if (u === 't') return { sec: '40' };
    return { reps: u === 'u' ? '8' : '10', word: true, side: side };
  }
  if (role === 'cool') return { sec: u === 's' ? '30' : '40', side: side };
  if (role === 'pf') {
    if (u === 't') return { sec: '60' };
    return { reps: u === 'u' ? '8' : '10', word: true, slow: true, side: side };
  }
  if (role === 'cardio') {
    var wk = level === 1 ? 20 : (level === 2 ? 30 : 40);
    return { kind: 'cardio', w: wk, r: (60 - wk > 30 ? 40 : 30) };
  }
  if (role === 'core') {
    var sets = level === 1 ? 2 : 3;
    if (u === 't' || u === 's') return { sets: sets, sec: String(level === 1 ? 20 : (level === 2 ? 30 : 40)), side: side, rest: 30 };
    return { sets: sets, reps: level === 1 ? '10-12' : '12-15', side: side, rest: 30 };
  }
  var s = Math.min(g.sets, level === 1 ? 3 : g.sets);
  if (u === 't' || u === 's') return { sets: s, sec: level === 1 ? '20-30' : (level === 2 ? '30-40' : '40-60'), side: side, rest: g.rest };
  var lo = g.lo, hi = g.hi;
  if (level === 1) { hi = Math.max(lo + 2, hi - 2); }
  if (level === 3 && goalKey !== 'strength') { lo += 2; hi += 2; }
  return { sets: s, reps: lo + '-' + hi, side: side, rest: g.rest };
}

/* Мой формат: один подход на круг, блок повторяется rounds раз */
function prescriptionMine(ex, role, level) {
  var u = ex.unit, side = (u === 'u' || u === 's');
  if (u === 't' || u === 's') return { sec: String(level === 1 ? 20 : (level === 2 ? 30 : 40)), side: side };
  var n = role === 'core' ? (level === 1 ? 12 : (level === 2 ? 15 : 20)) : (level === 1 ? 10 : (level === 2 ? 12 : 15));
  return { reps: String(n), side: side };
}

function fmtRx(rx) {
  if (typeof rx === 'string') return rx;
  if (rx.kind === 'cardio') return tr('rx.cardio', { w: rx.w, r: rx.r });
  var s = rx.sets ? rx.sets + ' × ' : '';
  if (rx.sec) s += rx.sec + ' ' + tr('rx.sec');
  else s += rx.reps + (rx.word ? ' ' + tr(rx.slow ? 'rx.slow' : 'rx.reps') : '');
  if (rx.side) s += ' ' + tr('rx.side');
  if (rx.rest) s += ', ' + tr('rx.rest', { n: rx.rest });
  return s;
}

/* Текст назначения с учетом стиля блока */
function fmtItem(it, b) {
  var rx = it.rx;
  if (!b || !b.style || typeof rx === 'string' || rx.kind === 'cardio') return fmtRx(rx);
  var r = b.rounds || 3, c = {};
  Object.keys(rx).forEach(function (k) { c[k] = rx[k]; });
  if (b.style === 'sides') c.side = false;
  if (b.style === 'ladder') {
    var step = c.sec ? 5 : 1, base = parseInt(c.sec || c.reps, 10), arr = [];
    for (var i = 0; i < r; i++) arr.push(base + i * step);
    if (c.sec) c.sec = arr.join('/'); else c.reps = arr.join('/');
  }
  return fmtRx(c);
}
function styleLabel(b) { return b.style ? tr('st.' + b.style) : ''; }
function styleDesc(b) { return b.style ? tr('st.' + b.style + '.d', { n: b.rounds || 3 }) : ''; }

function restyle(lib, form, program, si, bi, seed) {
  var b = program.sessions[si].blocks[bi], order = ['circuit', 'ladder', 'sides'];
  var ctx = { level: form.level, equip: form.equip, restr: form.restr };
  var rnd = mulberry32(seed);
  for (var step = 1; step <= 3; step++) {
    var next = order[(order.indexOf(b.style || 'circuit') + step) % 3];
    if (next !== 'sides') { b.style = next; return true; }
    var items = b.items.slice(), ok = true;
    for (var i = 0; i < items.length && ok; i++) {
      var cur = null;
      for (var q = 0; q < lib.length; q++) if (lib[q].id === items[i].exId) cur = lib[q];
      if (cur && isUni(cur)) continue;
      var ids = items.map(function (x) { return x.exId; });
      var pool = eligible(lib, items[i].pat, ctx, ids).filter(isUni);
      var ex = pick(pool, rnd, ctx.level, form.equip.indexOf('t') >= 0);
      if (!ex) ok = false; else items[i] = makeItem(ex, items[i].role, form.goal, ctx.level, 'mine');
    }
    if (ok) { b.items = items; b.style = 'sides'; return true; }
  }
  return false;
}

function makeItem(ex, role, goalKey, level, fmt) {
  var rx = fmt === 'mine' && role !== 'cardio' ? prescriptionMine(ex, role, level) : prescription(ex, role, goalKey, level);
  return { exId: ex.id, name: ex.name, role: role, pat: ex.pat, eq: (ex.eq || []).slice(), rx: rx, url: ex.url || '', note: ex.note || '' };
}

function generateProgram(lib, form, seed, history) {
  var rnd = mulberry32(seed);
  var hist = (history || []).slice(-6).reverse(), recent = {};
  hist.forEach(function (h, i) { (h.ids || []).forEach(function (id) { if (!recent[id]) recent[id] = i + 1; }); });
  var lastStyles = hist.length && hist[0].styles ? hist[0].styles : null;
  var ctx = { level: form.level, equip: form.equip, restr: form.restr };
  var plan = weekPlan(form.days, form.goal);
  var nWork = form.minutes === 30 ? 4 : (form.minutes === 45 ? 5 : 6);
  var nCore = form.minutes === 60 ? 2 : 1;
  var nWarm = form.minutes === 60 ? 3 : 2;
  var nCool = nWarm;
  var prefT = form.format === 'mine' && ctx.equip.indexOf('t') >= 0;
  var weekUsed = [], warnings = [];
  var sessions = plan.map(function (key, di) {
    var tpl = TEMPLATES[key], used = [], blocks = [];
    function take(pat, role, fresh) {
      var pool = eligible(lib, pat, ctx, used.concat(fresh ? weekUsed : []));
      if (!pool.length && fresh) pool = eligible(lib, pat, ctx, used);
      var ex = pick(pool, rnd, ctx.level, prefT, recent);
      if (!ex) { warnings.push({ pat: pat }); return null; }
      used.push(ex.id); if (fresh) weekUsed.push(ex.id);
      return makeItem(ex, role, form.goal, ctx.level, form.format);
    }
    function many(n, pat, role, fresh) {
      var out = [];
      for (var i = 0; i < n; i++) { var it = take(pat, role, fresh); if (it) out.push(it); }
      return out;
    }
    if (form.format === 'mine') {
      var n = form.minutes === 30 ? 2 : (form.minutes === 45 ? 3 : 4), rounds = form.rounds || 3;
      var v = form.variety || 2;
      var focus = form.focus || 'full', defs;
      if (focus === 'lower') defs = [
        { key: 'legs', pats: ['squat', 'lunge', 'squat', 'lunge'], n: n },
        { key: 'glutes', pats: ['glute', 'hinge', 'glute', 'hinge'], n: n },
        { key: 'abs', pats: ['core', 'core', 'core', 'core'], n: form.minutes === 60 ? 4 : 3 }];
      else if (focus === 'upper') defs = [
        { key: 'back', pats: ['pull', 'pull', 'shoulder', 'pull'], n: n },
        { key: 'arms', pats: ['push', 'shoulder', 'arm', 'push'], n: n },
        { key: 'abs', pats: ['core', 'core', 'core', 'core'], n: form.minutes === 60 ? 4 : 3 }];
      else defs = [
        { key: 'legs', pats: shuffle(['squat', 'lunge', 'glute', 'hinge'], rnd), n: n },
        { key: 'hands', pats: shuffle(['push', 'pull', 'arm', 'shoulder'], rnd), n: n },
        { key: 'abs', pats: ['core', 'core', 'core', 'core'], n: form.minutes === 60 ? 4 : 3 }];
      var styles = null;
      for (var tries = 0; tries < 6; tries++) {
        styles = v === 1 ? ['circuit', 'circuit', 'circuit'] : (v === 2 ? shuffle(['circuit', 'ladder', 'circuit'], rnd) : shuffle(['circuit', 'ladder', 'sides'], rnd));
        if (v === 1 || !lastStyles) break;
        var same = defs.every(function (d, i) { return lastStyles[d.key] === styles[i]; });
        if (!same) break;
      }
      defs.forEach(function (d, i) {
        var style = styles[i], items = [];
        if (style === 'sides') {
          d.pats.forEach(function (pat) {
            if (items.length >= d.n) return;
            var pool = eligible(lib, pat, ctx, used.concat(weekUsed)).filter(isUni);
            if (!pool.length) pool = eligible(lib, pat, ctx, used).filter(isUni);
            var ex = pick(pool, rnd, ctx.level, prefT, recent);
            if (ex) { used.push(ex.id); weekUsed.push(ex.id); items.push(makeItem(ex, d.key === 'abs' ? 'core' : 'work', form.goal, ctx.level, 'mine')); }
          });
          if (items.length < 2) { style = 'circuit'; items = []; }
        }
        if (style !== 'sides') {
          items = [];
          d.pats.slice(0, d.n).forEach(function (pat) { var it = take(pat, d.key === 'abs' ? 'core' : 'work', true); if (it) items.push(it); });
        }
        blocks.push({ key: d.key, rounds: rounds, style: style, items: items });
      });
      if (GOALS[form.goal].cardio) blocks.push({ key: 'cardio', items: many(1, 'cardio', 'cardio', true) });
      blocks = blocks.filter(function (b) { return b.items.length; });
      return { n: di + 1, tpl: null, focus: focus, blocks: blocks };
    }
    blocks.push({ key: 'warm', items: many(nWarm, 'warm', 'warm', false) });
    var work = [];
    tpl.slots.slice(0, nWork).forEach(function (pat) { var it = take(pat, 'work', true); if (it) work.push(it); });
    blocks.push({ key: 'work', items: work });
    blocks.push({ key: 'core', items: many(nCore, 'core', 'core', true) });
    if (GOALS[form.goal].cardio) blocks.push({ key: 'cardio', items: many(form.minutes === 60 ? 2 : 1, 'cardio', 'cardio', true) });
    blocks.push({ key: 'cool', items: many(nCool, 'cool', 'cool', false) });
    if (form.pf) blocks.push({ key: 'pf', items: many(2, 'pf', 'pf', false) });
    blocks = blocks.filter(function (b) { return b.items.length; });
    return { n: di + 1, tpl: key, blocks: blocks };
  });
  var uniq = warnings.filter(function (w, i) { return warnings.findIndex(function (x) { return x.pat === w.pat; }) === i; });
  return { sessions: sessions, warnings: uniq };
}

function historyEntry(program, form) {
  var ids = [], styles = {};
  program.sessions.forEach(function (s) { s.blocks.forEach(function (b) { if (b.style) styles[b.key] = b.style; b.items.forEach(function (it) { ids.push(it.exId); }); }); });
  return { t: Date.now(), ids: ids, styles: styles, focus: form.format === 'mine' ? (form.focus || 'full') : 'std', name: program.name || '' };
}

function swapItem(lib, form, program, si, bi, ii, seed) {
  var rnd = mulberry32(seed);
  var ctx = { level: form.level, equip: form.equip, restr: form.restr };
  var sess = program.sessions[si], item = sess.blocks[bi].items[ii];
  var inSession = [];
  sess.blocks.forEach(function (b) { b.items.forEach(function (x) { inSession.push(x.exId); }); });
  var pool = eligible(lib, item.pat, ctx, inSession);
  var ex = pick(pool, rnd, ctx.level, form.format === 'mine' && ctx.equip.indexOf('t') >= 0);
  if (!ex) return false;
  sess.blocks[bi].items[ii] = makeItem(ex, item.role, form.goal, ctx.level, form.format);
  return true;
}

function sessionTitle(s) {
  if (typeof s.title === 'string') return s.title;
  return tr('day', { n: s.n }) + (s.tpl ? '. ' + tr('tpl.' + s.tpl) : '');
}
function blockLabel(b) { return b.label || tr('blk.' + b.key); }
function warnText(w) { return typeof w === 'string' ? w : tr('warn.nopool', { pat: PAT_LABELS[w.pat] }); }
function progression() { return [1, 2, 3, 4].map(function (i) { return tr('prog.' + i); }); }
function programHint(p) { return p.form.format === 'mine' ? tr('hint.rounds', { n: p.form.rounds || 3 }) : GOALS[p.form.goal].tip; }

function programToText(p, lib, lang) {
  return withLang(lang || LANG, function () {
    var out = [], f = p.form;
    out.push(tr('txt.title') + (p.name ? ': ' + p.name : ''));
    out.push(tr('txt.goal') + ': ' + GOALS[f.goal].label + '. ' + tr('txt.level') + ': ' + LEVELS[f.level] + '. ' + tr('txt.summary', { days: f.days, min: f.minutes }));
    out.push(programHint(p));
    p.sessions.forEach(function (s) {
      out.push('');
      out.push(sessionTitle(s).toUpperCase());
      s.blocks.forEach(function (b) {
        out.push('');
        out.push(blockLabel(b) + (b.rounds ? ' (' + tr('blk.rounds', { n: b.rounds }) + ')' : '') + ':');
        if (b.style) out.push(styleLabel(b) + '. ' + styleDesc(b));
        b.items.forEach(function (it, i) {
          var ex = exByItem(it, lib), pro = ex ? exPro(ex) : '', how = ex ? exHow(ex) : '';
          out.push((i + 1) + '. ' + itemName(it, lib) + (pro && pro.toLowerCase() !== itemName(it, lib).toLowerCase() ? ' (' + pro + ')' : '') + ': ' + fmtItem(it, b) + (it.url ? ' (' + tr('txt.video') + ': ' + it.url + ')' : ''));
          if (how) out.push('   ' + how);
        });
      });
    });
    out.push('');
    out.push(tr('prog.title') + ':');
    progression().forEach(function (l) { out.push(l); });
    return out.join('\n');
  });
}

if (typeof module !== 'undefined') {
  module.exports = { defaultExercises: defaultExercises, generateProgram: generateProgram, swapItem: swapItem, programToText: programToText, fmtRx: fmtRx, fmtItem: fmtItem, restyle: restyle, exName: exName, exPro: exPro, exHow: exHow, historyEntry: historyEntry, withLang: withLang, tr: tr, GOALS: GOALS, TEMPLATES: TEMPLATES, PAT_LABELS: PAT_LABELS, I18N: I18N, sessionTitle: sessionTitle, setLang: function (l) { LANG = l; } };
}
