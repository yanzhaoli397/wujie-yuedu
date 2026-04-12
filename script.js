// ==================== API 配置 ====================
const API_BASE = 'http://127.0.0.1:5000/api';

// ==================== 用户系统 ====================
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users') || '[]');

// 检查登录状态
async function checkLoginStatus() {
    try {
        const response = await fetch(`${API_BASE}/check`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            currentUser = data.user;
        } else {
            currentUser = null;
        }
    } catch (error) {
        console.log('后端未连接，使用本地模式');
        // 降级到本地存储模式
        currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    }
    updateUserInfo();
}

// ==================== 全局状态 ====================
let currentMode = 'elder';
let currentPage = 'home';
let currentBook = null;
let currentReadingPosition = 0;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let isSpeaking = false;

// ==================== 书籍数据 ====================
const books = [
    { id: 1, title: '红楼梦', author: '曹雪芹', desc: '中国古典四大名著之首，以贾、史、王、薛四大家族为背景，展现了封建社会的真实面貌。', content: `第一回 甄士隐梦幻识通灵 贾雨村风尘怀闺秀\n\n此开卷第一回也。作者自云：因曾历过一番梦幻之后，故将真事隐去，而借“通灵”之说，撰此《石头记》一书也。故曰“甄士隐”云云。\n\n满纸荒唐言，一把辛酸泪！都云作者痴，谁解其中味？\n\n却说那女娲氏炼石补天之时，于大荒山无稽崖炼成高经十二丈、方经二十四丈顽石三万六千五百零一块。娲皇氏只用了三万六千五百块，只单单剩了一块未用，便弃在此山青埂峰下。\n\n谁知此石自经煅炼之后，灵性已通，因见众石俱得补天，独自己无材不堪入选，遂自怨自叹，日夜悲号惭愧。\n\n一日，正当嗟悼之际，俄见一僧一道远远而来，生得骨格不凡，丰神迥异，说说笑笑来至峰下，坐于石边高谈快论。\n\n先是说些云山雾海神仙玄幻之事，后便说到红尘中荣华富贵。此石听了，不觉打动凡心，也想要到人间去享一享这荣华富贵。\n\n那僧便念咒书符，大展幻术，将一块大石登时变成一块鲜明莹洁的美玉，且又缩成扇坠大小的可佩可拿。\n\n那僧托于掌上，笑道：“形体倒也是个宝物了！还只没有实在的好处，须得再镌上数字，使人一见便知是奇物方妙。”\n\n然后携你到那昌明隆盛之邦，诗礼簪缨之族，花柳繁华地，温柔富贵乡去安身乐业。\n\n石头听了，感谢不尽。那僧便袖了这石，同那道人飘然而去，竟不知投奔何方何舍。\n\n后来，又不知过了几世几劫，因有个空空道人访道求仙，忽从这大荒山无稽崖青埂峰下经过，忽见一大块石上字迹分明，编述历历。\n\n空空道人乃从头一看，原来就是无材补天，幻形入世，茫茫大士、渺渺真人携入红尘，历尽离合悲欢炎凉世态的一段故事。\n\n后面又有一首偈云：无材可去补苍天，枉入红尘若许年。此系身前身后事，倩谁记去作奇传？\n\n空空道人听如此说，思忖半晌，将《石头记》再检阅一遍，因见上面虽有些指奸责佞贬恶诛邪之语，亦非伤时骂世之旨。\n\n从头至尾抄录回来，问世传奇。因空见色，由色生情，传情入色，自色悟空，遂易名为情僧，改《石头记》为《情僧录》。\n\n东鲁孔梅溪则题曰《风月宝鉴》。后因曹雪芹于悼红轩中披阅十载，增删五次，纂成目录，分出章回，则题曰《金陵十二钗》。\n\n并题一绝云：满纸荒唐言，一把辛酸泪！都云作者痴，谁解其中味？\n\n出则既明，且看石上是何故事。按那石上书云：当日地陷东南，这东南一隅有处曰姑苏，有城曰阊门者，最是红尘中一二等富贵风流之地。\n\n这阊门外有个十里街，街内有个仁清巷，巷内有个古庙，因地方窄狭，人皆呼作葫芦庙。庙旁住着一家乡宦，姓甄，名费，字士隐。\n\n嫡妻封氏，情性贤淑，深明礼义。家中虽不甚富贵，然本地便也推他为望族了。因这甄士隐禀性恬淡，不以功名为念，每日只以观花修竹、酌酒吟诗为乐，倒是神仙一流人品。\n\n只是一件不足：如今年已半百，膝下无儿，只有一女，乳名唤作英莲，年方三岁。` },

    { id: 2, title: '西游记', author: '吴承恩', desc: '中国古代第一部浪漫主义章回体长篇神魔小说，讲述了唐僧师徒四人西天取经的故事。', content: `第一回 灵根育孕源流出 心性修持大道生\n\n诗曰：混沌未分天地乱，茫茫渺渺无人见。自从盘古破鸿蒙，开辟从兹清浊辨。覆载群生仰至仁，发明万物皆成善。欲知造化会元功，须看西游释厄传。\n\n盖闻天地之数，有十二万九千六百岁为一元。将一元分为十二会，乃子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥之十二支也。每会该一万八百岁。\n\n且就一日而论：子时得阳气，而丑则鸡鸣；寅不通光，而卯则日出；辰时食后，而巳则挨排；日午天中，而未则西蹉；申时晡而日落酉，戌黄昏而人定亥。\n\n譬于大数，若到戌会之终，则天地昏缯而万物否矣。再去五千四百岁，交亥会之初，则当黑暗，而两间人物俱无矣，故曰混沌。\n\n又五千四百岁，亥会将终，贞下起元，近子之会，而复逐渐开明。邵康节曰：“冬至子之半，天心无改移。一阳初动处，万物未生时。”到此，天始有根。\n\n再五千四百岁，正当子会，轻清上腾，有日，有月，有星，有辰。日、月、星、辰，谓之四象。故曰，天开于子。\n\n又经五千四百岁，子会将终，近丑之会，而逐渐坚实。易曰：“大哉乾元！至哉坤元！万物资生，乃顺承天。”至此，地始凝结。\n\n再五千四百岁，正当丑会，重浊下凝，有水，有火，有山，有石，有土。水、火、山、石、土谓之五形。故曰，地辟于丑。\n\n又经五千四百岁，丑会终而寅会之初，发生万物。历曰：“天气下降，地气上升；天地交合，群物皆生。”至此，天清地爽，阴阳交合。\n\n再五千四百岁，正当寅会，生人，生兽，生禽，正谓天地人三才定位。故曰，人生于寅。\n\n感盘古开辟，三皇治世，五帝定伦，世界之间，遂分为四大部洲：曰东胜神洲，曰西牛贺洲，曰南赡部洲，曰北俱芦洲。\n\n这部书单表东胜神洲。海外有一国土，名曰傲来国。国近大海，海中有一座名山，唤为花果山。\n\n此山乃十洲之祖脉，三岛之来龙，自开清浊而立，鸿蒙判后而成。真个好山！\n\n有词赋为证。赋曰：势镇汪洋，威宁瑶海。势镇汪洋，潮涌银山鱼入穴；威宁瑶海，波翻雪浪蜃离渊。\n\n水火方隅高积土，东海之处耸崇巅。丹崖怪石，削壁奇峰。丹崖上，彩凤双鸣；削壁前，麒麟独卧。\n\n峰头时听锦鸡鸣，石窟每观龙出入。林中有寿鹿仙狐，树上有灵禽玄鹤。瑶草奇花不谢，青松翠柏长春。\n\n仙桃常结果，修竹每留云。一条涧壑藤萝密，四面原堤草色新。正是百川会处擎天柱，万劫无移大地根。\n\n那座山，正当顶上，有一块仙石。其石有三丈六尺五寸高，有二丈四尺围圆。三丈六尺五寸高，按周天三百六十五度；二丈四尺围圆，按政历二十四气。\n\n上有九窍八孔，按九宫八卦。四面更无树木遮阴，左右倒有芝兰相衬。盖自开辟以来，每受天真地秀，日精月华，感之既久，遂有灵通之意。\n\n内育仙胞，一日迸裂，产一石卵，似圆球样大。因见风，化作一个石猴，五官俱备，四肢皆全。便就学爬学走，拜了四方。\n\n目运两道金光，射冲斗府。惊动高天上圣大慈仁者玉皇大天尊玄穹高上帝，驾座金阙云宫灵霄宝殿，聚集仙卿，见有金光焰焰，即命千里眼、顺风耳开南天门观看。` },

    { id: 3, title: '三国演义', author: '罗贯中', desc: '中国第一部长篇章回体历史演义小说，描写了东汉末年到西晋初年之间的历史风云。', content: `第一回 宴桃园豪杰三结义 斩黄巾英雄首立功\n\n滚滚长江东逝水，浪花淘尽英雄。是非成败转头空。青山依旧在，几度夕阳红。\n\n白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢。古今多少事，都付笑谈中。\n\n话说天下大势，分久必合，合久必分。周末七国分争，并入于秦。及秦灭之后，楚、汉分争，又并入于汉。\n\n汉朝自高祖斩白蛇而起义，一统天下，后来光武中兴，传至献帝，遂分为三国。\n\n推其致乱之由，殆始于桓、灵二帝。桓帝禁锢善类，崇信宦官。及桓帝崩，灵帝即位，大将军窦武、太傅陈蕃共相辅佐。\n\n时有宦官曹节等弄权，窦武、陈蕃谋诛之，机事不密，反为所害，中涓自此愈横。\n\n建宁二年四月望日，帝御温德殿。方升座，殿角狂风骤起。只见一条大青蛇，从梁上飞将下来，蟠于椅上。\n\n帝惊倒，左右急救入宫，百官俱奔避。须臾，蛇不见了。忽然大雷大雨，加以冰雹，落到半夜方止，坏却房屋无数。\n\n建宁四年二月，洛阳地震；又海水泛溢，沿海居民，尽被大浪卷入海中。光和元年，雌鸡化雄。\n\n六月朔，黑气十馀丈，飞入温德殿中。秋七月，有虹现于玉堂；五原山岸，尽皆崩裂。种种不祥，非止一端。\n\n帝下诏问群臣以灾异之由，议郎蔡邕上疏，以为蜺堕鸡化，乃妇寺干政之所致，言颇切直。\n\n帝览奏叹息，因起更衣。曹节在后窃视，悉宣告左右；遂以他事陷邕于罪，放归田里。\n\n后张让、赵忠、封谞、段珪、曹节、侯览、蹇硕、程旷、夏恽、郭胜十人朋比为奸，号为“十常侍”。\n\n帝尊信张让，呼为“阿父”。朝政日非，以致天下人心思乱，盗贼蜂起。\n\n时巨鹿郡有兄弟三人，一名张角，一名张宝，一名张梁。那张角本是个不第秀才，因入山采药，遇一老人，碧眼童颜，手执藜杖，唤角至一洞中，以天书三卷授之，曰：“此名《太平要术》，汝得之，当代天宣化，普救世人；若萌异心，必获恶报。”\n\n角拜问姓名。老人曰：“吾乃南华老仙也。”言讫，化阵清风而去。\n\n角得此书，晓夜攻习，能呼风唤雨，号为“太平道人”。中平元年正月内，疫气流行，张角散施符水，为人治病，自称“大贤良师”。\n\n角有徒弟五百馀人，云游四方，皆能书符念咒。次后徒众日多，角乃立三十六方，大方万馀人，小方六七千，各立渠帅，称为将军。\n\n讹言：“苍天已死，黄天当立；岁在甲子，天下大吉。”令人各以白土书“甲子”二字于家中大门上。\n\n青、幽、徐、冀、荆、扬、兖、豫八州之人，家家侍奉大贤良师张角名字。角遣其党马元义，暗赍金帛，结交中涓封谞，以为内应。\n\n角与二弟商议曰：“至难得者，民心也。今民心已顺，若不乘势取天下，诚为可惜。”遂一面私造黄旗，约期举事；一面使弟子唐周，驰书报封谞。\n\n唐周乃径赴省中告变。帝召大将军何进调兵擒马元义，斩之；次收封谞等一干人下狱。\n\n张角闻知事露，星夜举兵，自称“天公将军”，张宝称“地公将军”，张梁称“人公将军”。申言于众曰：“今汉运将终，大圣人出。汝等皆宜顺天从正，以乐太平。”\n\n四方百姓，裹黄巾从张角反者四五十万。贼势浩大，官军望风而靡。何进奏帝火速降诏，令各处备御，讨贼立功。\n\n一面遣中郎将卢植、皇甫嵩、朱儁，各引精兵，分三路讨之。且说张角一军，前犯幽州界分。幽州太守刘焉，乃江夏竟陵人氏，汉鲁恭王之后也。\n\n当时闻得贼兵将至，召校尉邹靖计议。靖曰：“贼兵众，我兵寡，明公宜作速招军应敌。”刘焉然其说，随即出榜招募义兵。\n\n榜文行到涿县，乃引出涿县中一个英雄。那人不甚好读书；性宽和，寡言语，喜怒不形于色；素有大志，专好结交天下豪杰。\n\n生得身长七尺五寸，两耳垂肩，双手过膝，目能自顾其耳，面如冠玉，唇若涂脂；中山靖王刘胜之后，汉景帝阁下玄孙，姓刘名备，字玄德。` },

    { id: 4, title: '水浒传', author: '施耐庵', desc: '中国历史上最早用白话文写成的章回小说之一，描写了梁山好汉反抗压迫的故事。', content: `第一回 张天师祈禳瘟疫 洪太尉误走妖魔\n\n话说大宋仁宗天子在位，嘉祐三年三月三日，五更三点，天子驾坐紫宸殿，受百官朝贺。\n\n但见：祥云迷凤阁，瑞气罩龙楼。含烟御柳拂旌旗，带露宫花迎剑戟。\n\n当有殿头官喝道：“有事出班早奏，无事卷帘退朝。”只见班部丛中，宰相赵哲、参政文彦博出班奏曰：“目今京师瘟疫盛行，伤损军民甚多。伏望陛下释罪宽恩，省刑薄税，祈禳天灾，救济万民。”\n\n天子听奏，急敕翰林院随即草诏，一面降赦天下罪囚，应有民间税赋悉皆赦免；一面命在京宫观寺院，修设好事禳灾。\n\n不料其年瘟疫转盛。仁宗天子闻知，龙体不安。复会百官计议。向那班部中，有一大臣越班启奏。天子看时，乃是参知政事范仲淹。\n\n拜罢起居，奏曰：“目今天灾盛行，军民涂炭，日夕不能聊生。以臣愚意，要禳此灾，可宣嗣汉天师星夜临朝，就京师禁院修设三千六百分罗天大醮，奏闻上帝，可以禳保民间瘟疫。”\n\n仁宗天子准奏。急令翰林学士草诏一道，天子御笔亲书，并降御香一炷，钦差内外提点殿前太尉洪信为天使，前往江西信州龙虎山，宣请嗣汉天师张真人星夜来朝，祈禳瘟疫。\n\n金殿上，仁宗天子御笔亲书圣旨，并降御香一炷。洪太尉领了圣旨，辞别了天子，带了从人，离了东京，取路径投信州贵溪县来。\n\n于路上但见：遥山叠翠，远水澄清。奇花绽锦绣铺林，嫩柳舞金丝拂地。风和日暖，时过野店山村；路直沙平，夜宿邮亭驿馆。\n\n风尘仆仆，行了数日，来到信州。大小官员出郭迎接。随即安排车辆马匹，同往龙虎山上去。\n\n到的明日，大小官员接诏，随即提点宫衙，摆列香花灯烛，对圣旨开设，请江西龙虎山嗣汉天师张真人，拜受圣旨。\n\n大小官员，拜罢圣旨。那洪太尉问：“天师今在何处？”住持真人向前禀道：“这代祖师号曰虚靖天师，性好清高，倦于迎送，自向龙虎山顶，结一茅庵，修真养性。因此不住本宫。”\n\n太尉道：“目今天子宣诏，如何得见？”真人答道：“容禀：诏敕权供在殿上，贫道等亦不敢开读。且请太尉到方丈献茶，再烦计议。”\n\n当时将丹诏供养在三清殿上，与众官都到方丈。太尉居中坐下，执事人等献茶，就进斋供，水陆俱备。\n\n斋罢，太尉问真人道：“既然天师在山顶庵中，何不着人请将下来，相见开读？”真人答道：“这代天师，非同小可。虽然年幼，其实道行非常。\n\n他是额外之人，四方显化，极是灵验。世人皆称为道通祖师。常人如何得见？怎生请得？”太尉道：“似此如何得见！目今京师瘟疫盛行，今上天子特遣下官，赍捧御书丹诏，亲奉龙香，来请天师，要做三千六百分罗天大醮，以禳天灾，救济万民。\n\n似此怎生奈何！”真人禀道：“天子要救万民，只除是太尉办一点志诚心，斋戒沐浴，更换布衣，休带从人，自背诏书，焚烧御香，步行上山，礼拜叩请天师，方许得见。\n\n若是心不志诚，空走一遭，亦不能见。”太尉听说，便道：“俺从京师食素到此，如何心不志诚？既然恁地，依着你说，明日绝早上山。”` },

    { id: 5, title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', desc: 'A timeless fable about love, loneliness, and friendship.', content: `Chapter 1\n\nOnce when I was six years old I saw a magnificent picture in a book, called True Stories from Nature, about the primeval forest. It was a picture of a boa constrictor in the act of swallowing an animal.\n\nIn the book it said: "Boa constrictors swallow their prey whole, without chewing it. After that they are not able to move, and they sleep through the six months that they need for digestion."\n\nI pondered deeply, then, over the adventures of the jungle. And after some work with a colored pencil I succeeded in making my first drawing. My Drawing Number One.\n\nI showed my masterpiece to the grown-ups, and asked them whether the drawing frightened them.\n\nBut they answered: "Frighten? Why should any one be frightened by a hat?"\n\nMy drawing was not a picture of a hat. It was a picture of a boa constrictor digesting an elephant. But since the grown-ups were not able to understand it, I made another drawing: I drew the inside of the boa constrictor, so that the grown-ups could see it clearly.\n\nGrown-ups never understand anything by themselves, and it is tiresome for children to be always and forever explaining things to them.\n\nSo then I chose another profession, and learned to pilot airplanes. I have flown a little over all parts of the world; and it is true that geography has been very useful to me.\n\nAt a glance I can distinguish China from Arizona. If one gets lost in the night, such knowledge is valuable.\n\nSo I lived my life alone, without anyone that I could really talk to, until I had an accident with my plane in the Desert of Sahara, six years ago.\n\nSomething was broken in my engine. And as I had with me neither a mechanic nor any passengers, I set myself to attempt the difficult repairs all alone.\n\nIt was a question of life or death for me: I had scarcely enough drinking water to last a week.\n\nThe first night, then, I went to sleep on the sand, a thousand miles from any human habitation. I was more isolated than a shipwrecked sailor on a raft in the middle of the ocean.\n\nThus you can imagine my amazement, at sunrise, when I was awakened by an odd little voice. It said: "If you please--draw me a sheep!"\n\n"What!"\n\n"Draw me a sheep!"\n\nI jumped to my feet, completely thunderstruck. I blinked my eyes hard. I looked carefully all around me. And I saw a most extraordinary small person, who stood there examining me with great seriousness.\n\nHere you may see the best portrait that, later, I was able to make of him. But my drawing is certainly very much less charming than its model.\n\nThat, however, is not my fault. The grown-ups discouraged me in my painter's career when I was six years old, and I had learned to draw nothing except boas from the outside and boas from the inside.\n\nNow I stared at this sudden apparition with my eyes fairly starting out of my head in astonishment. Remember, I had crashed in the desert a thousand miles from any inhabited region.\n\nAnd yet my little man seemed neither to be straying uncertainly among the sands, nor to be fainting from fatigue or hunger or thirst or fear. Nothing about him gave any suggestion of a child lost in the middle of the desert, a thousand miles from any human habitation.\n\nWhen at last I was able to speak, I said to him: "But--what are you doing here?"\n\nAnd in answer he repeated, very slowly, as if he were speaking of a matter of great consequence: "If you please--draw me a sheep."` },

    { id: 6, title: '骆驼祥子', author: '老舍', desc: '老舍先生的代表作之一，讲述旧北京人力车夫祥子的悲惨人生。', content: `第一章\n\n我们所要介绍的是祥子，不是骆驼，因为“骆驼”只是个外号；那么，我们就先说祥子，随手儿把骆驼与祥子那点关系说过去，也就算了。\n\n北平的洋车夫有许多派：年轻力壮，腿脚灵利的，讲究赁漂亮的车，拉“整天儿”，爱什么时候出车与收车都有自由；拉出车来，在固定的“车口”或宅门一放，专等坐快车的主儿；弄好了，也许一下子弄个一块两块的；碰巧了，也许白耗一天，连“车份儿”也没着落，但也不在乎。\n\n这一派哥儿们的希望大概有两个：或是拉包车；或是自己买上辆车，有了自己的车，再去拉包月或散座就没大关系了，反正车是自己的。\n\n比这一派岁数稍大的，或因身体的关系而跑得稍差点劲的，或因家庭的关系而不敢白耗一天的，大概就多数的拉八成新的车；人与车都有相当的漂亮，所以在要价儿的时候也还能保持住相当的尊严。\n\n这派的车夫，也许拉“整天儿”，也许拉“半天儿”。在后者的情形下，因为还有相当的精气神，所以无论冬天夏天总是“拉晚儿”。夜间，当然比白天需要更多的留神与本事；钱自然也多挣一些。\n\n年纪在四十以上，二十以下的，恐怕就不易在前两派里有个地位了。他们的车破，又不敢“拉晚儿”，所以只能早早的出车，希望能从清晨转到午后三四点钟，拉出“车份儿”和自己的嚼谷。\n\n他们的车破，跑得慢，所以得多走路，少要钱。到瓜市，果市，菜市，去拉货物，他们是他们这一行的精英。他们有时候也把车放在“车口”上，专等那能出大价钱的座儿；这种机会并不很多，他们也不希望一定成功，所以往往带着货物，拉上就跑。\n\n他们心里可也有谱儿：拉多少钱，必须有一定的成数，不多要，也不少要。四十以上的人，有的是力气，而没有车，所以不敢随便拉；二十以下的人，有的是车，而不敢随便跑；他们都是这一行的弱者。\n\n祥子，在与“骆驼”这个外号发生关系以前，是个较比有自由的洋车夫，这就是说，他是属于年轻力壮，而且自己有车的那一类：自己的车，自己的钱，在闲时，自己的主张，自己的事情。\n\n他不怕吃苦，也没有一般洋车夫的恶习，他的聪明和努力都足以使他的志愿成为事实。假若他的环境好一些，或多受着点教育，他一定不会落在“胶皮团”里，而且无论是干什么，他总不会辜负了他的机会。\n\n不幸，他必须拉洋车；好在这个营生里他也证明出他的能力与聪明。他仿佛就是在地狱里也能作个好鬼似的。\n\n生长在乡间，失去了父母与几亩薄田，十八岁的时候便跑到城里来。带着乡间小伙子的足壮与诚实，凡是以卖力气就能吃饭的事他几乎全作过了。\n\n可是，不久他就看出来，拉车是件更容易挣钱的事；作别的苦工，收入是有限的；拉车多着一些变化与机会，不知道在什么时候与地点就会遇到一些多于所希望的报酬。\n\n自然，他也晓得这样的机遇不完全出于偶然，而必须人与车都得漂亮精神，有货可卖才能遇到识货的人。想了一想，他相信自己有那个资格：他有力气，年纪正轻；所差的是他还没有跑过，与不敢一上手就拉漂亮的车。\n\n但这不是不能胜过的困难，有他的身体与力气作基础，他只要试验个十天半月的，就一定能跑得有个样子，然后去赁辆新车，说不定很快的就能拉上包车，然后省吃俭用的一年二年，即使是三四年，他必能自己打上一辆车，顶漂亮的车！\n\n看着自己的青年的肌肉，他以为这只是时间的问题，这是必能达到的一个志愿与目的，绝不是梦想！他的身量与筋肉都发展到年岁前边去；二十来的岁，他已经很大很高，虽然肢体还没被年月铸成一定的格局，可是已经像个成人了——一个脸上身上都带出天真淘气的样子的大人。\n\n看着那高等的车夫，他计划着怎样杀进他的腰去，好更显出他的铁扇面似的胸，与直硬的背；扭头看看自己的肩，多么宽，多么威严！杀好了腰，再穿上肥腿的白裤，裤脚用鸡肠子带儿系住，露出那对“出号”的大脚！是的，他无疑的可以成为最出色的车夫；傻子似的他自己笑了。\n\n他没有什么模样，使他可爱的是脸上的精神。头不很大，圆眼，肉鼻子，两条眉很短很粗，头上永远剃得发亮。腮上没有多余的肉，脖子可是几乎与头一边儿粗；脸上永远红扑扑的，特别亮的是颧骨与右耳之间一块不小的疤——小时候在树下睡觉，被驴啃了一口。\n\n他不甚注意他的模样，他爱自己的脸正如同他爱自己的身体，都那么结实硬棒；他把脸仿佛算在四肢之内，只要硬棒就好。是的，到城里以后，他还能头朝下，倒着立半天。这样立着，他觉得，他就很象一棵树，上下没有一个地方不挺脱的。\n\n他确乎有点像一棵树，坚壮，沉默，而又有生气。他有自己的打算，有些心眼，但不好向别人讲论。在洋车夫里，个人的委屈与困难是公众的话料，“车口儿”上，小茶馆中，大杂院里，每人报告着形容着或吵嚷着自己的事，而后这些事成为大家的财产，象些民歌似的由一处传到一处。\n\n祥子是乡下人，口齿没有城里人那么灵便；设若口齿灵利是出于天才，他天生来的不愿多说话，所以也不愿学着城里人的贫嘴恶舌。他的事他知道，不喜欢和别人讨论。因为嘴常闲着，所以他有工夫去思想，他的眼仿佛是老看着自己的心。\n\n只要他的主意打定，他便随着心中所开开的那条路儿走；假若走不通的话，他能一两天不出一声，咬着牙，好似咬着自己的心！他决定去拉车，就拉车去了。赁了辆破车，他先练练腿。第一天没拉着什么钱。第二天的生意不错，可是躺了两天，他的脚脖子肿得象两条瓠子似的，再也抬不起来。他忍受着，不管是怎样的疼痛。他知道这是不可避免的事，这是拉车必须经过的一关。\n\n非过了这一关，他不能放胆的去跑。脚好了之后，他敢跑了。这使他非常的痛快，因为别的没有什么可怕的了：地名他很熟习，等有时候他要是总不去拉，他便渐渐的知道共有多少条胡同，哪里有名，哪里是专拉买卖的。` },

    { id: 7, title: '浮生六记', author: '沈复', desc: '清代文学家沈复的自传体散文，记录与妻子陈芸的闺房之乐及坎坷人生。', content: `卷一 闺房记乐\n\n余生乾隆癸未冬卜一月二十有二日，正值太平盛世，且在衣冠之家，后苏州沧浪亭畔，天之厚我，可谓至矣。东坡云：“事如春梦了无痕”，苟不记之笔墨，未免有辜彼苍之厚。\n\n因思《关雎》冠三百篇之首，故列夫妇于首卷，余以次递及焉。所愧少年失学，稍识之无，不过记其实情实事而已，若必考订其文法，是责明于垢鉴矣。\n\n余幼聘金沙于氏，八龄而夭。娶陈氏。陈名芸，字淑珍，舅氏心余先生女也。生而颖慧，学语时，口授《琵琶行》，即能成诵。\n\n四龄失怙，母金氏，弟克昌，家徒壁立。芸既长，娴女红，三口仰其十指供给，克昌从师，修脯无缺。一日，于书簏中得《琵琶行》，挨字而认，始识字。\n\n刺绣之暇，渐通吟咏，有“秋侵人影瘦，霜染菊花肥”之句。余年十三，随母归宁，两小无嫌，得见所作，虽叹其才思隽秀，窃恐其福泽不深，然心注不能释，告母曰：“若为儿择妇，非淑姊不娶。”\n\n母亦爱其柔和，即脱金约指缔姻焉。此乾隆乙未七月十六日也。是年冬，值其堂姊出阁，余又随母往。芸与余同齿而长余十月，自幼姊弟相呼，故仍呼之曰淑姊。\n\n时但见满室鲜衣，芸独通体素淡，仅新其鞋而已。见其绣制精巧，询为己作，始知其慧心不仅在笔墨也。其形削肩长项，瘦不露骨，眉弯目秀，顾盼神飞，唯两齿微露，似非佳相。\n\n一种缠绵之态，令人之意也消。索观诗稿，有仅一联，或三四句，多未成篇者，询其故，笑曰：“无师之作，愿得知己堪师者敲成之耳。”余戏题其签曰“锦囊佳句”，不知夭寿之机此已伏矣。\n\n是夜送亲城外，返已漏三下，腹饥索饵，婢妪以枣脯进，余嫌其甜。芸暗牵余袖，随至其室，见藏有暖粥并小菜焉，余欣然举箸。\n\n忽闻芸堂兄玉衡呼曰：“淑妹速来！”芸急闭门曰：“已疲乏，将卧矣。”玉衡排闼入，见余将吃粥，乃笑睨芸曰：“顷我索粥，汝曰‘尽矣’，乃藏此专待汝婿耶？”\n\n芸大窘避去，上下哗笑之。余亦负气，挈老仆先归。自吃粥被嘲，再往，芸即避匿，余知其恐贻人笑也。\n\n至乾隆庚子正月二十二日花烛之夕，见瘦怯身材依然如昔，头巾既揭，相视嫣然。合卺后，并肩夜膳，余暗于案下握其腕，暖尖滑腻，胸中不觉抨抨作跳。\n\n芸回眸微笑，便觉一缕情丝摇人魂魄，拥之入帐，不知东方之既白。芸作新妇，初甚缄默，终日无怒容，与之言，微笑而已。\n\n事上以敬，处下以和，井井然未尝稍失。每见朝暾上窗，即披衣急起，如有人呼促之者。余笑曰：“今非吃粥比矣，何尚畏人嘲耶？”\n\n芸曰：“曩之藏粥待君，传为话柄，今非畏嘲，恐堂上道新娘懒惰耳。”余虽恋其卧而德其正，因亦随之早起。自此耳鬓相磨，亲同形影，爱恋之情有不可以言语形容者。\n\n而欢娱易过，转睫弥月。时吾父稼夫公在会稽幕府，专役相迓，受业于武林赵谷斋先生。先生循循善诱，余今日之尚能握管，先生力也。\n\n归来完姻时，原订随侍到馆。闻信之馀，心甚怅然，恐芸之对人堕泪。而芸反强颜劝勉，代整行装，是晚但觉神色稍异而已。\n\n临行，向余小语曰：“无人调护，自去经心！”及登舟解缆，正当桃李争研之候，而余则恍同林鸟失群，天地异色。\n\n到馆后，吾父即渡江东去。居三月，如十年之隔。芸虽时有书来，必两问一答，中多勉励词，余皆浮套语，心殊怏怏。\n\n每当风生竹院，月上蕉窗，对景怀人，梦魂颠倒。先生知其情，即致书吾父，出十题而遣余暂归。\n\n喜同戍人得赦，登舟后，反觉一刻如年。及抵家，吾母处问安毕，入房，芸起相迎，握手未通片语，而两人魂魄恍恍然化烟成雾，觉耳中惺然一响，不知更有此身矣。\n\n时当六月，内室炎蒸，幸居沧浪亭爱莲居西间壁，板桥内一轩临流，名曰“我取”，取“清斯濯缨，浊斯濯足”意也。\n\n檐前老树一株，浓阴覆窗，人面俱绿。隔岸游人往来不绝。此吾父稼夫公垂帘宴客处。禀命吾母，携芸消夏于此。\n\n因暑罢绣，终日伴余课书论古，品月评花而已。芸不善饮，强之可三杯，教以射覆为令。自以为人间之乐，无过于此矣。` },

    { id: 8, title: '朝花夕拾', author: '鲁迅', desc: '鲁迅先生唯一一部回忆性散文集，记录了作者从童年到青年的生活经历。', content: `小引\n\n我常想在纷扰中寻出一点闲静来，然而委实不容易。目前是这么离奇，心里是这么芜杂。一个人做到只剩了回忆的时候，生涯大概总要算是无聊了罢，但有时竟会连回忆也没有。\n\n中国的做文章有轨范，世事也仍然是螺旋。前几天我离开中山大学的时候，便想起四个月以前的离开厦门大学；听到飞机在头上鸣叫，竟记得了一年前在北京城上日日旋绕的飞机。我那时还做了一篇短文，叫做《一觉》。现在是，连这“一觉”也没有了。\n\n广州的天气热得真早，夕阳从西窗射入，逼得人只能勉强穿一件单衣。书桌上的一盆“水横枝”，是我先前没有见过的：就是一段树，只要浸在水中，枝叶便青葱得可爱。看看绿叶，编编旧稿，总算也在做一点事。\n\n做着这等事，真是虽生之日，犹死之年，很可以驱除炎热的。前天，已将《野草》编定了；这回便轮到陆续载在《莽原》上的《旧事重提》，我替它改了一个名称：《朝花夕拾》。\n\n带露折花，色香自然要好得多，但是我不能够。便是现在心目中的离奇和芜杂，我也还不能使他即刻幻化，转成离奇和芜杂的文章。或者，他日仰看流云时，会在我的眼前一闪烁罢。\n\n我有一时，曾经屡次忆起儿时在故乡所吃的蔬果：菱角、罗汉豆、茭白、香瓜。凡这些，都是极其鲜美可口的；都曾是使我思乡的蛊惑。后来，我在久别之后尝到了，也不过如此；惟独在记忆上，还有旧来的意味存留。\n\n他们也许要哄骗我一生，使我时时反顾。这十篇就是从记忆中抄出来的，与实际容或有些不同，然而我现在只记得是这样。文体大概很杂乱，因为是或作或辍，经了九个月之多。\n\n环境也不一：前两篇写于北京寓所的东壁下；中三篇是流离中所作，地方是医院和木匠房；后五篇却在厦门大学的图书馆的楼上，已经是被学者们挤出集团之后了。\n\n一九二七年五月一日，鲁迅于广州白云楼记。\n\n阿长与《山海经》\n\n长妈妈，已经说过，是一个一向带领着我的女工，说得阔气一点，就是我的保姆。我的母亲和许多别的人都这样称呼她，似乎略带些客气的意思。\n\n只有祖母叫她阿长。我平时叫她“阿妈”，连“长”字也不带；但到憎恶她的时候，——例如知道了谋死我那隐鼠的却是她的时候，就叫她阿长。\n\n我们那里没有姓长的；她生得黄胖而矮，“长”也不是形容词。又不是她的名字，记得她自己说过，她的名字是叫作什么姑娘的。什么姑娘，我现在已经忘却了，总之不是长姑娘；也终于不知道她姓什么。\n\n记得她也曾告诉过我这个名称的来历：先前的先前，我家有一个女工，身材生得很高大，这就是真阿长。后来她回去了，我那什么姑娘才来补她的缺，然而大家因为叫惯了，没有再改口，于是她从此也就成为长妈妈了。\n\n虽然背地里说人长短不是好事情，但倘使要我说句真心话，我可只得说：我实在不大佩服她。最讨厌的是常喜欢切切察察，向人们低声絮说些什么事。还竖起第二个手指，在空中上下摇动，或者点着对手或自己的鼻尖。\n\n我的家里一有些小风波，不知怎的我总疑心和这“切切察察”有些关系。又不许我走动，拔一株草，翻一块石头，就说我顽皮，要告诉我的母亲去了。\n\n一到夏天，睡觉时她又伸开两脚两手，在床中间摆成一个“大”字，挤得我没有余地翻身，久睡在一角的席子上，又已经烤得那么热。推她呢，不动；叫她呢，也不闻。\n\n“长妈妈生得那么胖，一定很怕热罢？晚上的睡相，怕不见得很好罢？……”母亲听到我多回诉苦之后，曾经这样地问过她。我也知道这意思是要她多给我一些空席。\n\n她不开口。但到夜里，我热得醒来的时候，却仍然看见满床摆着一个“大”字，一条臂膊还搁在我的颈子上。我想，这实在是无法可想了。\n\n但是她懂得许多规矩；这些规矩，也大概是我所不耐烦的。一年中最高兴的时节，自然要数除夕了。辞岁之后，从长辈得到压岁钱，红纸包着，放在枕边，只要过一宵，便可以随意使用。\n\n睡在枕上，看着红包，想到明天买来的小鼓，刀枪，泥人，糖菩萨……然而她进来，又将一个福橘放在床头了。\n\n“哥儿，你牢牢记住！”她极其郑重地说。“明天是正月初一，清早一睁开眼睛，第一句话就得对我说：‘阿妈，恭喜恭喜！’记得么？你要记着，这是一年的运气的事情。不许说别的话！说过之后，还得吃一点福橘。”\n\n她又拿起那橘子来在我的眼前摇了两摇，“那么，一年到头，顺顺流流……。”梦里也记得元旦的，第二天醒得特别早，一醒，就要坐起来。她却立刻伸出臂膊，一把将我按住。我惊异地看她时，只见她惶急地看着我。\n\n她又有所要求似的，摇着我的肩。我忽而记得了——“阿妈，恭喜……。”“恭喜恭喜！大家恭喜！真聪明！恭喜恭喜！”她于是十分欢喜似的，笑将起来，同时将一点冰冷的东西，塞在我的嘴里。我大吃一惊之后，也就忽而记得，这就是所谓福橘，元旦辟头的磨难，总算已经受完，可以下床玩耍去了。` }

];

// 确保每本书都有足够的段落
for (let book of books) {
    let paragraphs = book.content.split('\n\n');
    if (paragraphs.length < 20) {
        let additional = [];
        for (let i = paragraphs.length; i < 25; i++) {
            additional.push(`（续）${paragraphs[0].substring(0, 100)}... 这是第${i+1}段内容。书中自有黄金屋，书中自有颜如玉。继续阅读，品味经典。`);
        }
        book.content = book.content + '\n\n' + additional.join('\n\n');
    }
}

let readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '{}');
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

const appDiv = document.getElementById('app');
const body = document.getElementById('appBody');
const userInfoDiv = document.getElementById('userInfo');

// ==================== 后端 API 调用函数 ====================

async function callAPI(url, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${url}`, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        console.log('API调用失败:', error);
        return { success: false, error: error.message };
    }
}

async function syncReadingHistory() {
    if (!currentUser) return;
    const result = await callAPI('/history');
    if (result.success && result.data.history) {
        for (const item of result.data.history) {
            readingHistory[item.book_id] = item.position;
        }
        localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
    }
}

async function syncFavorites() {
    if (!currentUser) return;
    const result = await callAPI('/favorites');
    if (result.success && result.data.favorites) {
        favorites = result.data.favorites.map(f => f.book_id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

async function saveHistoryToServer(bookId, position) {
    if (!currentUser) return;
    await callAPI('/history', {
        method: 'POST',
        body: JSON.stringify({ book_id: bookId, position })
    });
}

async function addFavoriteToServer(bookId) {
    if (!currentUser) return;
    const result = await callAPI(`/favorites/${bookId}`, { method: 'POST' });
    return result.success;
}

async function removeFavoriteFromServer(bookId) {
    if (!currentUser) return;
    const result = await callAPI(`/favorites/${bookId}`, { method: 'DELETE' });
    return result.success;
}

// ==================== 用户系统函数 ====================

async function updateUserInfo() {
    if (currentUser) {
        userInfoDiv.innerHTML = `<span class="username-display">👤 ${currentUser.username}</span><button class="nav-btn" id="logoutBtn">退出</button>`;
        document.getElementById('logoutBtn')?.addEventListener('click', logout);
        // 登录后同步数据
        await syncReadingHistory();
        await syncFavorites();
    } else {
        userInfoDiv.innerHTML = `<button class="nav-btn" id="loginNavBtn">登录/注册</button>`;
        document.getElementById('loginNavBtn')?.addEventListener('click', () => renderAuth());
    }
}

async function logout() {
    await callAPI('/logout', { method: 'POST' });
    currentUser = null;
    localStorage.removeItem('currentUser');
    // 不清空本地阅读历史和书架，游客模式仍可使用
    updateUserInfo();
    renderHome();
    if (currentMode === 'vision') speakText('已退出登录');
}

async function register(username, password) {
    const result = await callAPI('/register', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    
    if (result.success) {
        currentUser = result.data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserInfo();
        renderHome();
        if (currentMode === 'vision') speakText('注册成功，欢迎您');
        return true;
    } else {
        alert(result.data.message || '注册失败');
        return false;
    }
}

async function login(username, password) {
    const result = await callAPI('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    
    if (result.success) {
        currentUser = result.data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserInfo();
        renderHome();
        if (currentMode === 'vision') speakText('登录成功');
        return true;
    } else {
        alert(result.data.message || '登录失败');
        return false;
    }
}

function renderAuth() {
    currentPage = 'auth';
    appDiv.innerHTML = `
        <div class="auth-container">
            <div class="auth-tabs">
                <button class="auth-tab active" data-tab="login">登录</button>
                <button class="auth-tab" data-tab="register">注册</button>
            </div>
            <div id="authForm">
                <div class="auth-form">
                    <div class="form-group">
                        <label>用户名</label>
                        <input type="text" id="username" placeholder="请输入用户名">
                    </div>
                    <div class="form-group">
                        <label>密码</label>
                        <input type="password" id="password" placeholder="请输入密码">
                    </div>
                    <button class="auth-submit" id="submitAuth">登录</button>
                </div>
            </div>
            <div class="guest-mode">
                <p>或</p>
                <button class="guest-btn" id="guestModeBtn">游客模式浏览</button>
            </div>
        </div>
    `;
    
    let activeTab = 'login';
    
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            activeTab = tab.dataset.tab;
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const submitBtn = document.getElementById('submitAuth');
            if (submitBtn) {
                submitBtn.textContent = activeTab === 'login' ? '登录' : '注册';
            }
        });
    });
    
    document.getElementById('submitAuth').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (!username || !password) {
            alert('请填写用户名和密码');
            return;
        }
        if (activeTab === 'login') {
            login(username, password);
        } else {
            register(username, password);
        }
    });
    
    document.getElementById('guestModeBtn').addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateUserInfo();
        renderHome();
        if (currentMode === 'vision') speakText('游客模式，您可以阅读所有书籍');
    });
}

// ==================== 模式切换 ====================
function setMode(mode) {
    currentMode = mode;
    body.classList.remove('elder-mode', 'vision-mode', 'hearing-mode');
    if (mode === 'elder') body.classList.add('elder-mode');
    if (mode === 'vision') body.classList.add('vision-mode');
    if (mode === 'hearing') body.classList.add('hearing-mode');
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'elder') document.getElementById('elderModeBtn').classList.add('active');
    if (mode === 'vision') document.getElementById('visionModeBtn').classList.add('active');
    if (mode === 'hearing') document.getElementById('hearingModeBtn').classList.add('active');
    
    localStorage.setItem('readingMode', mode);
    
    if (mode === 'vision' && currentPage === 'reading') {
        speakText(`已切换到视障模式`);
    }
    
    if (currentPage === 'home') renderHome();
    else if (currentPage === 'reading' && currentBook) renderReading();
}

function speakText(text, callback) {
    if (currentMode !== 'vision') return;
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1;
    currentUtterance = utterance;
    utterance.onend = () => { isSpeaking = false; if (callback) callback(); };
    speechSynthesis.speak(utterance);
    isSpeaking = true;
}

function stopSpeaking() {
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    isSpeaking = false;
}

// ==================== 页面渲染函数 ====================
function renderHome() {
    currentPage = 'home';
    appDiv.innerHTML = `
        <div class="quick-links">
            <div class="quick-card" tabindex="0" role="button" data-nav="library"><h3>📚 公版书库</h3><p>浏览所有经典名著</p></div>
            <div class="quick-card" tabindex="0" role="button" data-nav="shelf"><h3>⭐ 我的书架</h3><p>已收藏 ${favorites.length} 本书</p></div>
            <div class="quick-card" tabindex="0" role="button" data-nav="history"><h3>🕐 阅读历史</h3><p>最近阅读的书籍</p></div>
            <div class="quick-card" tabindex="0" role="button" data-nav="help"><h3>❓ 帮助中心</h3><p>使用教程与客服</p></div>
        </div>
        <h2 tabindex="0">📖 热门公版名著推荐</h2>
        <div class="book-grid">
            ${books.map(book => `
                <div class="book-card">
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">${book.author}</div>
                    <div class="book-desc">${book.desc.substring(0, 80)}${book.desc.length > 80 ? '...' : ''}</div>
                    <button class="read-btn" data-read="${book.id}">立即阅读</button>
                </div>
            `).join('')}
        </div>
    `;
    
    document.querySelectorAll('.quick-card').forEach(card => {
        card.addEventListener('click', () => {
            const nav = card.dataset.nav;
            if (nav === 'library') renderLibrary();
            else if (nav === 'shelf') renderShelf();
            else if (nav === 'history') renderHistory();
            else if (nav === 'help') renderHelp();
        });
    });
    
    document.querySelectorAll('.read-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const bookId = parseInt(btn.dataset.read);
            const book = books.find(b => b.id === bookId);
            if (book) openBook(book);
        });
    });
}

function renderLibrary() {
    appDiv.innerHTML = `
        <h2>📚 全部公版名著</h2>
        <div class="book-grid">
            ${books.map(book => `
                <div class="book-card">
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">${book.author}</div>
                    <div class="book-desc">${book.desc}</div>
                    <button class="read-btn" data-read="${book.id}">立即阅读</button>
                </div>
            `).join('')}
        </div>
        <button class="control-btn" id="backHome">返回首页</button>
    `;
    document.querySelectorAll('.read-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const book = books.find(b => b.id == btn.dataset.read);
            if (book) openBook(book);
        });
    });
    document.getElementById('backHome')?.addEventListener('click', renderHome);
}

function renderShelf() {
    const shelfBooks = favorites.map(id => books.find(b => b.id === id)).filter(b => b);
    appDiv.innerHTML = `
        <h2>⭐ 我的书架</h2>
        ${shelfBooks.length === 0 ? '<p>暂无收藏书籍，去书库添加吧~</p>' : `
            <div class="book-grid">
                ${shelfBooks.map(book => `
                    <div class="book-card">
                        <div class="book-title">${book.title}</div>
                        <div class="book-author">${book.author}</div>
                        <div class="book-desc">${book.desc.substring(0, 60)}...</div>
                        <button class="read-btn" data-read="${book.id}">继续阅读</button>
                        <button class="control-btn" data-remove="${book.id}" style="margin-top:8px">移除书架</button>
                    </div>
                `).join('')}
            </div>
        `}
        <button class="control-btn" id="backHome">返回首页</button>
    `;
    document.querySelectorAll('.read-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const book = books.find(b => b.id == btn.dataset.read);
            if (book) openBook(book);
        });
    });
    document.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const bookId = parseInt(btn.dataset.remove);
            favorites = favorites.filter(id => id !== bookId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            await removeFavoriteFromServer(bookId);
            renderShelf();
        });
    });
    document.getElementById('backHome')?.addEventListener('click', renderHome);
}

function renderHistory() {
    const historyList = Object.entries(readingHistory).map(([id, pos]) => {
        const book = books.find(b => b.id == id);
        return book ? { ...book, position: pos } : null;
    }).filter(b => b);
    appDiv.innerHTML = `
        <h2>🕐 阅读历史</h2>
        ${historyList.length === 0 ? '<p>暂无阅读历史，开始阅读一本书吧~</p>' : `
            <div class="book-grid">
                ${historyList.map(book => `
                    <div class="book-card">
                        <div class="book-title">${book.title}</div>
                        <div class="book-author">${book.author}</div>
                        <div class="book-desc">上次阅读位置：第${book.position + 1}段</div>
                        <button class="read-btn" data-read="${book.id}">继续阅读</button>
                    </div>
                `).join('')}
            </div>
        `}
        <button class="control-btn" id="backHome">返回首页</button>
    `;
    document.querySelectorAll('.read-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const book = books.find(b => b.id == btn.dataset.read);
            if (book) openBook(book);
        });
    });
    document.getElementById('backHome')?.addEventListener('click', renderHome);
}

function renderHelp() {
    appDiv.innerHTML = `
        <div class="help-section">
            <h2>📘 无障碍帮助中心</h2>
            <h3>👁️ 视障模式</h3>
            <p>• 自动语音朗读当前内容</p>
            <p>• 支持 Tab 键切换，Enter 键确认</p>
            <p>• 阅读页面：← → 方向键切换段落，空格键控制朗读/暂停</p>
            <button class="control-btn" id="demoSpeech" style="margin: 12px 0">🔊 试听语音演示</button>
            
            <h3>👂 听障模式</h3>
            <p>• 超大字体、高对比度显示</p>
            <p>• 支持字体放大/缩小、背景主题切换</p>
            <p>• 阅读页面：点击上一段/下一段按钮，或使用 ← → 方向键翻页</p>
            
            <h3>👴 老年模式</h3>
            <p>• 大字体、柔和背景、简化界面</p>
            <p>• 阅读页面：支持翻页功能，可调节字体大小</p>
            
            <h3>📞 人工客服</h3>
            <p>文字客服：service@wujieyuedu.com | 语音客服热线：400-800-1234</p>
            <p style="margin-top: 12px; font-size: 0.9em;">📚 版权说明：本站书籍均为公版名著（作者去世超50年），公益免费阅读。</p>
        </div>
        <button class="control-btn" id="backHome">返回首页</button>
    `;
    document.getElementById('demoSpeech')?.addEventListener('click', () => speakText('欢迎使用无界阅读无障碍平台，如有问题请联系客服。'));
    document.getElementById('backHome')?.addEventListener('click', renderHome);
}

// ==================== 阅读页核心功能 ====================
function openBook(book) {
    currentBook = book;
    currentPage = 'reading';
    currentReadingPosition = readingHistory[book.id] || 0;
    renderReading();
}

function goToPrevParagraph() {
    if (!currentBook) return;
    const paragraphs = currentBook.content.split('\n\n');
    if (currentReadingPosition > 0) {
        currentReadingPosition--;
        readingHistory[currentBook.id] = currentReadingPosition;
        localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
        saveHistoryToServer(currentBook.id, currentReadingPosition);
        renderReading();
        if (currentMode === 'vision') speakText('上一段');
    } else if (currentMode === 'vision') {
        speakText('已经是第一段了');
    }
}

function goToNextParagraph() {
    if (!currentBook) return;
    const paragraphs = currentBook.content.split('\n\n');
    if (currentReadingPosition < paragraphs.length - 1) {
        currentReadingPosition++;
        readingHistory[currentBook.id] = currentReadingPosition;
        localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
        saveHistoryToServer(currentBook.id, currentReadingPosition);
        renderReading();
        if (currentMode === 'vision') speakText('下一段');
    } else if (currentMode === 'vision') {
        speakText('已经是最后一段了');
    }
}

function renderReading() {
    if (!currentBook) return;
    const paragraphs = currentBook.content.split('\n\n');
    const currentPara = paragraphs[currentReadingPosition] || paragraphs[0];
    
    let controlsHtml = '';
    if (currentMode === 'vision') {
        controlsHtml = `
            <div class="voice-controls">
                <button class="control-btn primary" id="playPause">🔊 朗读/暂停</button>
                <button class="control-btn" id="prevPara">⏮ 上一段</button>
                <button class="control-btn" id="nextPara">⏭ 下一段</button>
                <select id="rateSelect">
                    <option value="0.8">慢速</option>
                    <option value="1" selected>标准</option>
                    <option value="1.2">快速</option>
                    <option value="1.5">极快</option>
                </select>
            </div>
        `;
    } else {
        controlsHtml = `
            <div class="reading-control-bar">
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button class="control-btn" id="fontPlus">🔍 A+ 放大字体</button>
                    <button class="control-btn" id="fontMinus">🔍 A- 缩小字体</button>
                    <button class="control-btn" id="themeToggle">🎨 切换背景</button>
                </div>
                <div class="nav-controls">
                    <button class="control-btn page-nav-btn" id="prevParaElder">⏮ 上一段</button>
                    <span style="font-size: 1.1em; font-weight: bold; padding: 0 12px;">${currentReadingPosition + 1} / ${paragraphs.length}</span>
                    <button class="control-btn page-nav-btn" id="nextParaElder">下一段 ⏭</button>
                </div>
            </div>
        `;
    }
    
    appDiv.innerHTML = `
        <div class="reading-container">
            <div class="reading-controls">
                <button class="control-btn" id="backToHome">🏠 返回首页</button>
                <button class="control-btn" id="addToShelf">⭐ ${favorites.includes(currentBook.id) ? '已收藏' : '加入书架'}</button>
            </div>
            ${controlsHtml}
            <div class="reading-content" id="readingContent">
                ${currentPara.replace(/\n/g, '<br>')}
            </div>
            <div class="paragraph-info">
                📖 第 ${currentReadingPosition + 1} 段 / 共 ${paragraphs.length} 段
                ${currentMode !== 'vision' ? '<br>💡 提示：点击按钮或按 ← → 方向键切换段落' : '<br>💡 提示：按空格键控制朗读，← → 方向键切换段落'}
            </div>
        </div>
    `;
    
    document.getElementById('backToHome')?.addEventListener('click', () => {
        stopSpeaking();
        renderHome();
    });
    
    document.getElementById('addToShelf')?.addEventListener('click', async () => {
        if (favorites.includes(currentBook.id)) {
            favorites = favorites.filter(id => id !== currentBook.id);
            await removeFavoriteFromServer(currentBook.id);
            if (currentMode === 'vision') speakText('已移除书架');
        } else {
            favorites.push(currentBook.id);
            await addFavoriteToServer(currentBook.id);
            if (currentMode === 'vision') speakText('已加入书架');
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderReading();
    });
    
    if (currentMode === 'vision') {
        const playBtn = document.getElementById('playPause');
        const prevBtn = document.getElementById('prevPara');
        const nextBtn = document.getElementById('nextPara');
        const rateSelect = document.getElementById('rateSelect');
        const contentDiv = document.getElementById('readingContent');
        
        if (contentDiv) {
            contentDiv.classList.add('highlight');
            speakText(currentPara);
        }
        
        playBtn?.addEventListener('click', () => {
            if (isSpeaking) stopSpeaking();
            else speakText(document.getElementById('readingContent')?.innerText.replace(/<br>/g, '\n') || '');
        });
        
        prevBtn?.addEventListener('click', goToPrevParagraph);
        nextBtn?.addEventListener('click', goToNextParagraph);
        
        rateSelect?.addEventListener('change', (e) => {
            if (currentUtterance) currentUtterance.rate = parseFloat(e.target.value);
        });
    } else {
        let currentFontSize = parseInt(getComputedStyle(document.body).fontSize);
        document.getElementById('fontPlus')?.addEventListener('click', () => {
            currentFontSize = Math.min(44, currentFontSize + 2);
            document.getElementById('readingContent').style.fontSize = currentFontSize + 'px';
        });
        document.getElementById('fontMinus')?.addEventListener('click', () => {
            currentFontSize = Math.max(18, currentFontSize - 2);
            document.getElementById('readingContent').style.fontSize = currentFontSize + 'px';
        });
        
        let themeIndex = 0;
        let themes = currentMode === 'hearing' ? ['#111111', '#1a1a2e', '#0a0a2a'] : ['#fff9e8', '#f0f7ff', '#e8f0e8'];
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            themeIndex = (themeIndex + 1) % themes.length;
            document.getElementById('readingContent').style.backgroundColor = themes[themeIndex];
            document.getElementById('readingContent').style.padding = '20px';
            document.getElementById('readingContent').style.borderRadius = '12px';
        });
        
        document.getElementById('prevParaElder')?.addEventListener('click', goToPrevParagraph);
        document.getElementById('nextParaElder')?.addEventListener('click', goToNextParagraph);
    }
    
    const handleKeydown = (e) => {
        if (currentPage !== 'reading') return;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPrevParagraph();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            goToNextParagraph();
        } else if (e.key === ' ' && currentMode === 'vision') {
            e.preventDefault();
            document.getElementById('playPause')?.click();
        }
    };
    document.removeEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', handleKeydown);
}

async function init() {
    const savedMode = localStorage.getItem('readingMode') || 'elder';
    await checkLoginStatus();
    setMode(savedMode);
    renderHome();
}

document.getElementById('elderModeBtn').addEventListener('click', () => setMode('elder'));
document.getElementById('visionModeBtn').addEventListener('click', () => setMode('vision'));
document.getElementById('hearingModeBtn').addEventListener('click', () => setMode('hearing'));

init();