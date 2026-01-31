/**
 * words-en-zh.js - 英中词库 v2.0
 * 词汇学习游戏
 *
 * 数据结构:
 * - meta: 词库元信息
 * - levels: 按级别组织的单词
 *
 * 单词结构:
 * - id: 唯一标识
 * - source: 源语言文本（英语）
 * - target: 目标语言文本（中文）
 * - wrongOptions: 错误选项 { target: [], source: [] }
 * - icon: 图标（可选）
 * - example: 例句（可选）
 * - tags: 标签（可选）
 */

const wordData_en_zh = {
  meta: {
    id: 'en-zh',
    name: '英语-中文',
    sourceLanguage: { code: 'en', name: '英语', tts: 'en-US' },
    targetLanguage: { code: 'zh', name: '中文', tts: 'zh-CN' },
    version: '2.0',
    totalWords: 1000
  },

  // 为了保持兼容性，直接使用旧词库数据并进行转换
  // 实际项目中可以逐步迁移到新格式
  levels: {}
};

/**
 * 从旧格式词库初始化新格式
 * 兼容层：支持旧版 wordDatabase
 */
function initWordDataFromLegacy() {
  if (typeof wordDatabase === 'undefined') {
    console.error('旧版词库 wordDatabase 未定义');
    return;
  }

  // 遍历所有级别
  for (let level = 0; level <= 10; level++) {
    const oldWords = wordDatabase[level];
    if (!oldWords) continue;

    wordData_en_zh.levels[level] = oldWords.map((word, index) => {
      // 生成唯一ID
      const id = `en-zh-${level}-${String(index).padStart(4, '0')}`;

      // 获取英文释义数据（仅 Level 7-10）
      const defData = generateDefinition(word.english);

      // 转换为新格式
      return {
        id: id,
        source: word.english,
        target: word.chinese,
        wrongOptions: {
          target: word.wrongOptions || [],
          source: generateReverseWrongOptions(word, oldWords)
        },
        icon: word.icon || null,
        example: generateExample(word.english),
        tags: generateTags(word, level),
        // 英英释义数据（用于 en-en 模式）
        definition: defData?.definition || null,
        wrongDefinitions: defData?.wrongDefinitions || [],
        // Level 10 增强字段
        morphology: word.morphology || null,
        etymology: word.etymology || null,
        examples: word.examples || null,
        synonyms: word.synonyms || null,
        antonyms: word.antonyms || null
      };
    });
  }

  // 更新总词数
  let total = 0;
  for (let level in wordData_en_zh.levels) {
    total += wordData_en_zh.levels[level].length;
  }
  wordData_en_zh.meta.totalWords = total;
}

/**
 * 生成反向错误选项（中→英时使用）
 * @param {object} word - 当前单词
 * @param {Array} allWords - 同级别所有单词
 */
function generateReverseWrongOptions(word, allWords) {
  // 随机选择2个不同的英文单词作为干扰项
  const options = [];
  const otherWords = allWords.filter(w => w.english !== word.english);

  // 随机打乱
  const shuffled = otherWords.sort(() => Math.random() - 0.5);

  // 取前2个
  for (let i = 0; i < Math.min(2, shuffled.length); i++) {
    options.push(shuffled[i].english);
  }

  return options;
}

/**
 * 生成例句（基于单词）
 * 简单实现：为常见单词提供预设例句
 * @param {string} word - 英文单词
 */
function generateExample(word) {
  // 剑桥词典风格例句库 (Cambridge Dictionary style)
  const examples = {
    // Level 0 - 基础词汇
    'apple': 'She took a bite of the apple.',
    'cat': 'The cat sat on the windowsill watching the birds.',
    'dog': 'Their dog barks at strangers.',
    'red': 'She was dressed in red from head to toe.',
    'blue': 'He wore a blue shirt and black trousers.',
    'green': 'The traffic light turned green.',
    'yellow': 'The leaves turn yellow in autumn.',
    'pink': 'She painted her room pink.',
    'black': 'He was wearing a black leather jacket.',
    'white': 'Snow White had skin as white as snow.',
    'one': 'Only one person came to the party.',
    'two': 'I have two sisters and a brother.',
    'three': 'The bus leaves in three minutes.',
    'four': 'There are four seasons in a year.',
    'five': 'I work five days a week.',
    'six': 'She gets up at six every morning.',
    'seven': 'There are seven days in a week.',
    'eight': 'The shop opens at eight o\'clock.',
    'nine': 'My daughter is nine years old.',
    'ten': 'I counted to ten before I opened my eyes.',
    'fish': 'We caught several fish in the river.',
    'bird': 'A bird was singing outside my window.',
    'egg': 'Would you like your eggs fried or scrambled?',
    'water': 'Can I have a glass of water, please?',
    'mom': 'Mom always knows what to say.',
    'dad': 'My dad taught me how to ride a bike.',
    'big': 'They live in a big house near the beach.',
    'small': 'The town is too small to have a cinema.',
    'yes': 'Yes, I would love to come.',
    'no': 'No, thank you. I\'m not hungry.',
    'sun': 'The sun was shining brightly.',
    'moon': 'There\'s a full moon tonight.',
    'star': 'The stars were twinkling in the night sky.',
    'car': 'She got into her car and drove away.',
    'bus': 'I usually take the bus to work.',
    'hat': 'He tipped his hat politely.',
    'shoe': 'These shoes are too tight for me.',
    'bag': 'She put the books in her bag.',
    'pen': 'Can I borrow your pen?',
    'cup': 'Would you like a cup of tea?',
    'box': 'He opened the box carefully.',
    'bed': 'I was in bed by ten o\'clock.',
    'leg': 'She broke her leg skiing.',
    'arm': 'He put his arm around her.',
    'eye': 'She has beautiful blue eyes.',
    'ear': 'He whispered something in her ear.',
    'nose': 'The dog has a wet nose.',
    'mouth': 'Open your mouth and say ah.',
    'hand': 'He held out his hand to shake.',
    'foot': 'I hurt my foot playing football.',
    'head': 'She nodded her head in agreement.',
    'face': 'A smile spread across her face.',
    'hair': 'She has long dark hair.',
    'door': 'Someone is knocking at the door.',
    'tree': 'They sat under a tree to have lunch.',
    'ball': 'The children were kicking a ball around.',
    'book': 'This book is really interesting.',
    'desk': 'There were papers all over his desk.',
    'map': 'We need a map to find the way.',
    'key': 'I can\'t find my car keys.',
    'zoo': 'The children love going to the zoo.',
    'hot': 'It\'s too hot to go outside.',
    'cold': 'I\'m cold. Can you close the window?',
    'new': 'Have you seen his new car?',
    'old': 'This is an old photograph of my grandmother.',
    'good': 'She speaks good English.',
    'bad': 'I have some bad news for you.',
    'tall': 'He\'s quite tall for his age.',
    'short': 'She\'s shorter than her brother.',
    'long': 'It\'s been a long day.',
    'fat': 'The cat has grown very fat.',
    'thin': 'She looks too thin. Is she eating properly?',
    'fast': 'He\'s a fast runner.',
    'slow': 'The traffic was slow this morning.',
    'up': 'She looked up at the sky.',
    'down': 'He walked down the street.',
    'in': 'She put the letter in her pocket.',
    'out': 'He went out to buy some milk.',
    'on': 'The book is on the table.',
    'off': 'Please turn the lights off.',

    // Level 1 - 常见名词
    'milk': 'Do you take milk in your coffee?',
    'juice': 'I\'ll have a glass of orange juice.',
    'tea': 'Would you like some tea?',
    'cake': 'She made a chocolate cake for his birthday.',
    'rice': 'We had chicken with rice for dinner.',
    'meat': 'I don\'t eat meat. I\'m a vegetarian.',
    'bread': 'Could you buy some bread on your way home?',
    'toy': 'The child was playing with her toys.',
    'doll': 'She loved her doll more than anything.',
    'kite': 'The wind is perfect for flying a kite.',
    'bike': 'He rides his bike to school every day.',
    'boat': 'They went out in a small boat.',
    'plane': 'The plane landed safely.',
    'train': 'We caught the early morning train.',
    'gift': 'Thank you for the lovely gift.',
    'candy': 'Too much candy is bad for your teeth.',
    'ice': 'Would you like some ice in your drink?',
    'snow': 'The children were playing in the snow.',
    'park': 'We went for a walk in the park.',
    'shop': 'The shop closes at six o\'clock.',
    'school': 'What time does school start?',
    'home': 'I\'ll be home by six.',
    'room': 'This room gets a lot of sunlight.',
    'house': 'They bought a house in the country.',
    'food': 'The food at the restaurant was excellent.',
    'fruit': 'You should eat more fruit and vegetables.',
    'banana': 'She peeled a banana and gave it to the child.',
    'orange': 'I had an orange for breakfast.',
    'pear': 'The pears are ripe and ready to eat.',
    'peach': 'This peach tastes wonderful.',
    'grape': 'These grapes are very sweet.',
    'lemon': 'Would you like a slice of lemon in your tea?',
    'mango': 'Mangoes are my favorite fruit.',
    'cherry': 'The cherry trees are in bloom.',
    'cookie': 'Would you like a cookie with your coffee?',
    'soup': 'I\'ll have a bowl of soup, please.',
    'noodle': 'She ordered a bowl of noodles.',
    'pizza': 'Let\'s order a pizza.',
    'burger': 'I\'ll have a burger and fries.',
    'salad': 'I had a salad for lunch.',
    'cheese': 'Would you like cheese on your sandwich?',
    'butter': 'Pass the butter, please.',
    'sugar': 'Do you take sugar in your tea?',
    'salt': 'Could you pass the salt?',
    'honey': 'She put honey in her tea.',
    'corn': 'The farmers are harvesting corn.',
    'potato': 'We had baked potatoes for dinner.',
    'tomato': 'Add some tomatoes to the salad.',
    'carrot': 'Carrots are good for your eyesight.',
    'onion': 'Chopping onions makes me cry.',
    'horse': 'She learned to ride a horse.',
    'sheep': 'The farmer keeps sheep on the hillside.',
    'rabbit': 'The rabbit hopped across the garden.',
    'mouse': 'The cat caught a mouse.',
    'frog': 'We could hear frogs croaking in the pond.',
    'snake': 'Some snakes are poisonous.',
    'lion': 'The lion is called the king of the jungle.',
    'tiger': 'Tigers are endangered animals.',
    'bear': 'We saw a bear in the forest.',
    'wolf': 'Wolves hunt in packs.',
    'fox': 'A fox got into the chicken coop.',
    'deer': 'A deer ran across the road.',
    'monkey': 'The monkeys were swinging from the trees.',
    'panda': 'Giant pandas eat bamboo.',
    'elephant': 'The elephant sprayed water with its trunk.',
    'whale': 'We went whale watching off the coast.',
    'shark': 'Sharks have an excellent sense of smell.',
    'dolphin': 'Dolphins are very intelligent animals.',
    'turtle': 'Sea turtles can live for over 100 years.',
    'butterfly': 'A beautiful butterfly landed on the flower.',
    'spider': 'There\'s a spider in the bathtub.',
    'owl': 'Owls hunt at night.',
    'eagle': 'The eagle soared high above the mountains.',
    'penguin': 'Penguins live in cold climates.',
    'friend': 'She\'s been my best friend since childhood.',

    // Level 2 - 简单动词
    'run': 'She runs five miles every morning.',
    'eat': 'We usually eat dinner at seven.',
    'play': 'The children were playing in the garden.',
    'sleep': 'I didn\'t sleep well last night.',
    'jump': 'The cat jumped onto the table.',
    'walk': 'I walk to work every day.',
    'sit': 'Please sit down and make yourself comfortable.',
    'stand': 'I had to stand on the bus all the way home.',
    'drink': 'I drink coffee every morning.',
    'read': 'She reads the newspaper every day.',
    'write': 'He wrote a letter to his grandmother.',
    'draw': 'She can draw really well.',
    'sing': 'She sings in the church choir.',
    'dance': 'They danced all night at the party.',
    'swim': 'I learned to swim when I was five.',
    'fly': 'The plane flies to Paris twice a day.',
    'open': 'Could you open the window, please?',
    'close': 'Please close the door behind you.',
    'give': 'She gave me a book for my birthday.',
    'take': 'Take an umbrella. It might rain.',
    'see': 'I can see the mountains from my window.',
    'hear': 'I can hear someone coming.',
    'say': 'What did you say?',
    'go': 'We\'re going to France for our holiday.',
    'come': 'She came to see me yesterday.',
    'stop': 'The bus stopped at the corner.',
    'start': 'The movie starts at eight.',
    'finish': 'I haven\'t finished my homework yet.',
    'help': 'Could you help me carry these bags?',
    'ask': 'She asked me a difficult question.',
    'answer': 'He didn\'t answer my question.',
    'look': 'Look at that beautiful sunset!',
    'listen': 'Listen carefully to the instructions.',
    'speak': 'She speaks three languages fluently.',
    'talk': 'We need to talk about this.',
    'tell': 'Tell me what happened.',
    'think': 'I think you\'re right.',
    'know': 'Do you know the answer?',
    'learn': 'I\'m learning to play the guitar.',
    'teach': 'She teaches English at a local school.',
    'study': 'He\'s studying medicine at university.',
    'work': 'She works for a law firm.',
    'rest': 'You should rest for a while.',
    'cook': 'He cooks dinner every night.',
    'wash': 'I need to wash my hands.',
    'clean': 'She cleans the house every Saturday.',
    'put': 'Put the books on the shelf.',
    'get': 'I need to get some milk from the store.',
    'buy': 'She bought a new dress for the party.',
    'sell': 'They\'re selling their house.',
    'pay': 'How would you like to pay?',
    'send': 'I\'ll send you an email tomorrow.',
    'bring': 'Could you bring me a glass of water?',
    'carry': 'She was carrying a heavy bag.',
    'hold': 'Hold my hand when we cross the street.',
    'drop': 'She dropped her phone and broke the screen.',
    'pick': 'He picked up the phone and answered it.',
    'throw': 'He threw the ball to his son.',
    'catch': 'She caught the ball with one hand.',
    'kick': 'He kicked the ball into the goal.',
    'hit': 'The ball hit him on the head.',
    'push': 'Push the button to start.',
    'pull': 'Pull the door to open it.',
    'climb': 'The children climbed the tree.',
    'fall': 'Be careful not to fall.',
    'cut': 'She cut the cake into eight pieces.',
    'break': 'Be careful not to break the glass.',
    'fix': 'He fixed the broken window.',
    'make': 'She made a beautiful cake.',
    'build': 'They\'re building a new house.',
    'grow': 'She grows vegetables in her garden.',
    'feed': 'Don\'t forget to feed the cat.',
    'ride': 'I ride my bike to school.',
    'drive': 'She drives to work every day.',
    'wait': 'Wait here until I come back.',
    'move': 'We\'re moving to a new house next month.',
    'turn': 'Turn left at the traffic lights.',
    'touch': 'Please don\'t touch the paintings.',
    'feel': 'I feel much better today.',
    'smell': 'Something smells delicious.',
    'taste': 'This soup tastes wonderful.',
    'cry': 'The baby started to cry.',
    'laugh': 'Everyone laughed at his joke.',
    'smile': 'She smiled and waved goodbye.',
    'shout': 'Don\'t shout at me!',

    // Level 3 - 家庭/身体
    'sister': 'My sister lives in London.',
    'brother': 'He has two brothers and a sister.',
    'baby': 'The baby is sleeping peacefully.',
    'grandma': 'Grandma tells the best stories.',
    'grandpa': 'Grandpa taught me to fish.',
    'family': 'We\'re having a family dinner on Sunday.',
    'tooth': 'She lost her first tooth.',
    'finger': 'He cut his finger while cooking.',
    'neck': 'She wore a scarf around her neck.',
    'back': 'My back hurts from sitting all day.',
    'heart': 'My heart was beating fast.',
    'body': 'Swimming is good for your whole body.',
    'tongue': 'The doctor asked him to stick out his tongue.',
    'lip': 'She bit her lip nervously.',
    'chin': 'He stroked his chin thoughtfully.',
    'cheek': 'She kissed him on the cheek.',
    'shoulder': 'He put his hand on her shoulder.',
    'elbow': 'Don\'t put your elbows on the table.',
    'wrist': 'She wears a watch on her left wrist.',
    'knee': 'He fell and hurt his knee.',
    'ankle': 'She twisted her ankle while running.',
    'toe': 'I stubbed my toe on the table leg.',
    'thumb': 'He gave a thumbs up sign.',
    'stomach': 'I have a stomach ache.',
    'chest': 'He had pains in his chest.',
    'skin': 'She has beautiful skin.',
    'bone': 'He broke a bone in his foot.',
    'blood': 'The nurse took a blood sample.',
    'uncle': 'My uncle lives in Canada.',
    'aunt': 'Aunt Mary is coming to visit.',
    'cousin': 'I\'m staying with my cousin this weekend.',
    'son': 'Their son is a doctor.',
    'daughter': 'Their daughter is studying law.',
    'husband': 'Her husband is a teacher.',
    'wife': 'He met his wife at university.',
    'parent': 'His parents live in the countryside.',
    'child': 'The child was playing with blocks.',
    'adult': 'This movie is for adults only.',
    'people': 'There were a lot of people at the concert.',
    'person': 'She\'s a very kind person.',
    'neighbor': 'Our neighbors are very friendly.',
    'guest': 'We\'re expecting guests for dinner.',
    'doctor': 'You should see a doctor about that cough.',
    'nurse': 'The nurse took her temperature.',
    'teacher': 'My teacher says I\'m making good progress.',
    'student': 'She\'s a medical student.',
    'worker': 'The factory employs 500 workers.',
    'farmer': 'The farmers are worried about the drought.',
    'driver': 'The taxi driver took us to the airport.',
    'police': 'The police are investigating the crime.',
    'king': 'The king ruled for forty years.',
    'queen': 'The queen attended the ceremony.',
    'prince': 'The prince married a princess.',
    'princess': 'The princess lived in a castle.',
    'hero': 'He was treated as a hero.',
    'team': 'Our team won the championship.',
    'class': 'There are 30 students in my class.',
    'age': 'What age are your children?',
    'voice': 'She has a beautiful singing voice.',
    'sound': 'I heard a strange sound.',
    'noise': 'The noise kept me awake all night.',
    'music': 'I like listening to music.',
    'movie': 'We watched a movie last night.',
    'picture': 'She drew a picture of her house.',
    'photo': 'Let me take a photo of you.',
    'story': 'Tell me a bedtime story.',
    'dream': 'I had a strange dream last night.',

    // Level 4 - 日常用品/地点
    'chair': 'Please take a chair and sit down.',
    'table': 'We sat around the table for dinner.',
    'window': 'She looked out of the window.',
    'clock': 'The clock on the wall says three o\'clock.',
    'phone': 'Your phone is ringing.',
    'lamp': 'She turned on the lamp.',
    'mirror': 'She looked at herself in the mirror.',
    'towel': 'There are clean towels in the bathroom.',
    'soap': 'Wash your hands with soap.',
    'brush': 'She brushed her hair.',
    'knife': 'Be careful with that knife.',
    'fork': 'We don\'t use knives and forks to eat sushi.',
    'spoon': 'She stirred her coffee with a spoon.',
    'plate': 'She put the food on a plate.',
    'bowl': 'She had a bowl of cereal for breakfast.',
    'bottle': 'There\'s a bottle of water in the fridge.',
    'basket': 'She carried a basket of vegetables.',
    'umbrella': 'Take an umbrella in case it rains.',
    'coat': 'Put your coat on. It\'s cold outside.',
    'shirt': 'He was wearing a white shirt.',
    'pants': 'These pants are too tight.',
    'skirt': 'She was wearing a short skirt.',
    'dress': 'She wore a beautiful dress to the party.',
    'jacket': 'He put on his jacket and left.',
    'sweater': 'Put on a sweater if you\'re cold.',
    'sock': 'I can\'t find a matching pair of socks.',
    'glove': 'You\'ll need gloves. It\'s freezing outside.',
    'scarf': 'She wrapped a scarf around her neck.',
    'belt': 'I need a belt to hold up these pants.',
    'ring': 'He gave her a diamond ring.',
    'watch': 'My watch says it\'s three o\'clock.',
    'glasses': 'I can\'t read without my glasses.',
    'wallet': 'He left his wallet at home.',
    'computer': 'I work on my computer all day.',
    'keyboard': 'This keyboard is really comfortable to type on.',
    'screen': 'The screen is too bright.',
    'camera': 'She bought a new camera for her trip.',
    'radio': 'We listened to the radio on the way.',
    'fridge': 'Put the milk in the fridge.',
    'oven': 'Preheat the oven to 180 degrees.',
    'sofa': 'He fell asleep on the sofa.',
    'pillow': 'These pillows are very soft.',
    'blanket': 'She pulled the blanket over her head.',
    'curtain': 'She closed the curtains.',
    'carpet': 'There\'s a stain on the carpet.',
    'shelf': 'Put the books back on the shelf.',
    'drawer': 'The scissors are in the drawer.',
    'kitchen': 'She spends a lot of time in the kitchen.',
    'bedroom': 'My bedroom overlooks the garden.',
    'bathroom': 'The bathroom is down the hall.',
    'garden': 'She grows flowers in her garden.',
    'garage': 'He parks his car in the garage.',
    'stairs': 'She ran up the stairs.',
    'elevator': 'Take the elevator to the fifth floor.',
    'floor': 'There\'s water on the floor.',
    'ceiling': 'There\'s a spider on the ceiling.',
    'wall': 'They painted the walls white.',
    'roof': 'The roof is leaking.',
    'gate': 'Please close the gate behind you.',
    'road': 'The road was closed for repairs.',
    'street': 'She lives on the next street.',
    'bridge': 'We walked across the bridge.',
    'station': 'The train station is five minutes away.',
    'airport': 'We arrived at the airport early.',
    'hospital': 'She was taken to the hospital.',

    // Level 5 - 自然/天气
    'flower': 'She received a bouquet of flowers.',
    'rain': 'The rain was pouring down.',
    'cloud': 'Dark clouds gathered in the sky.',
    'wind': 'The wind blew the leaves off the trees.',
    'sky': 'The sky is clear and blue today.',
    'grass': 'The grass needs cutting.',
    'leaf': 'The leaves are turning brown.',
    'river': 'The river flows through the city.',
    'lake': 'We swam in the lake.',
    'sea': 'We spent a week by the sea.',
    'ocean': 'They sailed across the ocean.',
    'beach': 'The children built sandcastles on the beach.',
    'mountain': 'They climbed the mountain.',
    'hill': 'There\'s a castle on top of the hill.',
    'forest': 'We went for a walk in the forest.',
    'desert': 'It rarely rains in the desert.',
    'island': 'They spent their honeymoon on a tropical island.',
    'rock': 'The boat hit a rock.',
    'sand': 'The children played in the sand.',
    'weather': 'The weather is lovely today.',
    'sunny': 'It\'s going to be sunny tomorrow.',
    'cloudy': 'It\'s a cloudy day today.',
    'rainy': 'It was a cold and rainy night.',
    'snowy': 'We had a snowy winter last year.',
    'windy': 'It\'s too windy to go sailing.',
    'foggy': 'It was foggy this morning.',
    'warm': 'It\'s warm enough to sit outside.',
    'cool': 'The evenings are getting cooler.',
    'wet': 'My shoes are wet from the rain.',
    'dry': 'The weather has been very dry lately.',
    'spring': 'Flowers bloom in spring.',
    'summer': 'We\'re going on holiday this summer.',
    'autumn': 'The leaves change color in autumn.',
    'fall': 'I love the colors of fall.',
    'winter': 'It snows here every winter.',
    'season': 'Autumn is my favorite season.',
    'sunrise': 'We woke up to watch the sunrise.',
    'sunset': 'We watched the sunset from the beach.',
    'morning': 'I usually exercise in the morning.',
    'afternoon': 'I\'ll call you this afternoon.',
    'evening': 'We usually have dinner in the evening.',
    'night': 'I couldn\'t sleep last night.',
    'today': 'What are you doing today?',
    'tomorrow': 'See you tomorrow.',
    'yesterday': 'I saw her yesterday.',
    'week': 'I\'ll see you next week.',
    'month': 'We moved here two months ago.',
    'year': 'Happy New Year!',
    'hour': 'The journey takes about an hour.',
    'minute': 'Wait a minute, please.',
    'time': 'What time is it?',

    // Level 6 - 形容词/副词
    'happy': 'She looked happy when she heard the news.',
    'sad': 'I feel sad when I think about it.',
    'angry': 'He gets angry when he\'s tired.',
    'afraid': 'She\'s afraid of the dark.',
    'brave': 'She was brave enough to speak up.',
    'tired': 'I\'m too tired to go out tonight.',
    'hungry': 'I\'m really hungry. Let\'s eat.',
    'thirsty': 'I\'m thirsty. Could I have some water?',
    'sick': 'She stayed home because she was sick.',
    'healthy': 'Eating vegetables keeps you healthy.',
    'strong': 'He\'s strong enough to lift that box.',
    'weak': 'She felt weak after the illness.',
    'busy': 'I\'m too busy to talk right now.',
    'free': 'Are you free this weekend?',
    'lazy': 'Don\'t be so lazy. Get up!',
    'kind': 'She\'s very kind to everyone.',
    'nice': 'What a nice surprise!',
    'cute': 'What a cute baby!',
    'ugly': 'The building is quite ugly.',
    'pretty': 'She looked very pretty in her new dress.',
    'clean': 'The room was spotlessly clean.',
    'dirty': 'Your hands are dirty. Go wash them.',
    'quiet': 'The house was quiet at night.',
    'loud': 'The music is too loud.',
    'soft': 'The pillow is really soft.',
    'hard': 'This bed is too hard.',
    'bright': 'The room was bright and airy.',
    'dark': 'It gets dark early in winter.',
    'light': 'The bag was surprisingly light.',
    'heavy': 'This box is too heavy for me to carry.',
    'empty': 'The room was completely empty.',
    'full': 'The train was full of commuters.',
    'rich': 'They became rich from the oil business.',
    'poor': 'Many families are too poor to buy food.',
    'same': 'We went to the same school.',
    'different': 'This is different from what I expected.',
    'true': 'Is it true that you\'re leaving?',
    'false': 'The accusation was completely false.',
    'right': 'You were right about the weather.',
    'wrong': 'I was wrong to trust him.',
    'easy': 'The test was easier than I expected.',
    'difficult': 'Learning a language is difficult.',
    'simple': 'The instructions are simple to follow.',
    'safe': 'Is it safe to walk here at night?',
    'dangerous': 'Swimming alone is dangerous.',
    'careful': 'Be careful not to spill the coffee.',
    'lucky': 'You\'re lucky to have such good friends.',
    'early': 'She arrived early for the meeting.',
    'late': 'Sorry I\'m late. The traffic was terrible.',
    'ready': 'Are you ready to go?',
    'sure': 'Are you sure about that?',
    'always': 'She always arrives on time.',
    'never': 'I have never been to Japan.',
    'sometimes': 'Sometimes I go jogging in the morning.',
    'often': 'How often do you exercise?',
    'usually': 'I usually get up at seven.',
    'already': 'I\'ve already finished my homework.',
    'still': 'She still lives with her parents.',
    'again': 'Can you say that again?',
    'together': 'Let\'s go together.',
    'alone': 'She lives alone.',
    'here': 'The taxi will be here in five minutes.',
    'there': 'Is anybody there?',
    'where': 'Where do you live?',
    'when': 'When does the train leave?',
    'why': 'Why didn\'t you tell me?',
    'how': 'How do you know my name?',
    'what': 'What time is it?',
    'who': 'Who told you that?',
    'because': 'I\'m tired because I didn\'t sleep well.',

    // Level 7 - 小学高年级
    'important': 'It\'s important to eat a healthy diet.',
    'example': 'Can you give me an example?',
    'problem': 'We have a problem with the computer.',
    'idea': 'I have an idea for the project.',
    'reason': 'What\'s the reason for the delay?',
    'result': 'We\'re waiting for the test results.',
    'information': 'For more information, visit our website.',
    'knowledge': 'She has extensive knowledge of history.',
    'experience': 'Do you have any experience in this field?',
    'practice': 'You need more practice.',
    'mistake': 'I made a mistake in my calculations.',
    'correct': 'That\'s the correct answer.',
    'possible': 'Is it possible to change the date?',
    'necessary': 'Is it really necessary to go?',
    'special': 'Is there any special reason you\'re asking?',
    'popular': 'This is a very popular restaurant.',
    'famous': 'Paris is famous for the Eiffel Tower.',
    'successful': 'The event was very successful.',
    'wonderful': 'We had a wonderful time.',
    'interesting': 'The documentary was very interesting.',
    'beautiful': 'What a beautiful view!',
    'useful': 'This book is very useful for students.',
    'useless': 'This old phone is useless now.',
    'common': 'This is a common mistake.',
    'rare': 'This is a rare opportunity.',
    'excellent': 'She did an excellent job.',
    'perfect': 'The weather was perfect for a picnic.',
    'terrible': 'The traffic was terrible this morning.',
    'amazing': 'The view from the top was amazing.',
    'surprising': 'It\'s not surprising that she was upset.',
    'exciting': 'It was an exciting game.',
    'boring': 'The lecture was incredibly boring.',
    'funny': 'He told us a funny story.',
    'serious': 'This is a serious problem.',
    'strange': 'There\'s something strange about this place.',
    'normal': 'Everything seems normal.',
    'crazy': 'That\'s a crazy idea, but it might work.',
    'wise': 'It would be wise to save some money.',
    'foolish': 'It was foolish of me to trust him.',
    'clever': 'She\'s a very clever girl.',
    'smart': 'He\'s smart enough to figure it out.',
    'stupid': 'That was a stupid thing to do.',
    'honest': 'He\'s always been honest with me.',
    'polite': 'It\'s polite to say thank you.',
    'rude': 'It\'s rude to talk with your mouth full.',
    'friendly': 'Everyone here is very friendly.',
    'selfish': 'Don\'t be so selfish. Share with your sister.',
    'generous': 'It was very generous of you to help.',
    'patient': 'You need to be more patient.',
    'nervous': 'I was nervous before the interview.',
    'worried': 'She\'s worried about her exams.',
    'excited': 'The children were excited about the trip.',
    'surprised': 'I was surprised to see her there.',
    'pleased': 'I\'m pleased to meet you.',
    'disappointed': 'I was disappointed with the results.',
    'satisfied': 'Are you satisfied with the service?',
    'bored': 'The children were bored during the long journey.',
    'interested': 'I\'m interested in learning more about it.',
    'confused': 'I\'m confused. Can you explain again?',
    'certain': 'Are you certain about that?',
    'doubt': 'I doubt he\'ll come to the party.',
    'believe': 'I don\'t believe a word he says.',
    'agree': 'I agree with you completely.',
    'disagree': 'I\'m afraid I disagree.',
    'accept': 'She accepted the job offer.',
    'refuse': 'He refused to answer my questions.',
    'allow': 'Smoking is not allowed here.',
    'forbid': 'My parents forbid me to stay out late.',
    'promise': 'She promised to call me back.',
    'decide': 'Have you decided what to do?',
    'choose': 'I can\'t decide which one to choose.',
    'prefer': 'I prefer tea to coffee.',
    'compare': 'Compare prices before you buy.',
    'describe': 'Can you describe what happened?',
    'explain': 'Could you explain that again?',
    'understand': 'I don\'t understand what you mean.',
    'realize': 'I didn\'t realize how late it was.',
    'remember': 'I can\'t remember his name.',
    'forget': 'Don\'t forget to lock the door.',
    'imagine': 'Imagine living on a desert island.',
    'expect': 'I didn\'t expect to see you here.',
    'hope': 'I hope to see you soon.',
    'wish': 'I wish I could help.',
    'succeed': 'She succeeded in passing the exam.',
    'fail': 'He failed to meet the deadline.',
    'try': 'You should try the chocolate cake.',
    'effort': 'It took a lot of effort to finish the project.',
    'progress': 'She\'s making good progress with her English.',
    'improve': 'Your English has improved a lot.',

    // Level 8 - 初中词汇
    'environment': 'We must protect the environment.',
    'communication': 'Good communication is essential in business.',
    'technology': 'Technology has changed the way we work.',
    'organization': 'She works for an international organization.',
    'development': 'The development of new technology takes time.',
    'relationship': 'We have a good working relationship.',
    'competition': 'There\'s a lot of competition for jobs.',
    'opportunity': 'This is a great opportunity for you.',
    'advantage': 'Being bilingual is a big advantage.',
    'disadvantage': 'The main disadvantage is the cost.',
    'achievement': 'Winning the award was a great achievement.',
    'experiment': 'Scientists are conducting an experiment.',
    'explanation': 'There must be a logical explanation.',
    'description': 'The police asked for a description of the suspect.',
    'suggestion': 'Do you have any suggestions?',
    'decision': 'Have you made a decision yet?',
    'responsibility': 'It\'s your responsibility to check the facts.',
    'improvement': 'There has been a big improvement in her work.',
    'conversation': 'We had a long conversation about politics.',
    'imagination': 'Children have vivid imaginations.',
    'celebration': 'There was a celebration after the victory.',
    'discovery': 'This was an important scientific discovery.',
    'adventure': 'They set off on a great adventure.',
    'attendance': 'Attendance at the meeting is compulsory.',
    'performance': 'Her performance in the play was excellent.',
    'professional': 'You should get professional advice.',
    'personal': 'I have some personal matters to attend to.',
    'social': 'He has excellent social skills.',
    'political': 'They were discussing political issues.',
    'economic': 'The country is facing economic problems.',
    'cultural': 'There are many cultural differences between us.',
    'natural': 'It\'s natural to feel nervous before an exam.',
    'artificial': 'The flowers looked real but were artificial.',
    'traditional': 'We cooked a traditional Christmas dinner.',
    'modern': 'The building has a very modern design.',
    'ancient': 'We visited some ancient ruins.',
    'historical': 'This is a historical landmark.',
    'scientific': 'Scientific research takes years of work.',
    'physical': 'Physical exercise is good for your health.',
    'mental': 'The job can be very mentally demanding.',
    'emotional': 'It was an emotional moment for everyone.',
    'national': 'Today is a national holiday.',
    'international': 'The company has an international reputation.',
    'global': 'Climate change is a global problem.',
    'local': 'I read about it in the local newspaper.',
    'public': 'The park is open to the public.',
    'private': 'This is a private matter.',
    'official': 'We\'re waiting for an official announcement.',
    'general': 'I have a general idea of what you mean.',
    'specific': 'Can you be more specific?',
    'particular': 'Is there any particular reason you\'re asking?',
    'original': 'Is this an original painting?',
    'basic': 'These are the basic principles.',
    'advanced': 'This is an advanced course for experienced students.',
    'average': 'The average age of the students is 18.',
    'regular': 'I\'m a regular customer at this coffee shop.',
    'frequent': 'Frequent exercise is good for your health.',
    'constant': 'The noise was constant throughout the night.',
    'various': 'There are various reasons for this.',
    'entire': 'I spent the entire day cleaning the house.',
    'complete': 'The project is now complete.',
    'separate': 'Keep the documents in separate folders.',
    'independent': 'She\'s very independent for her age.',
    'available': 'Is this seat available?',
    'recent': 'I haven\'t seen any recent photos.',
    'current': 'What is the current situation?',
    'previous': 'In my previous job, I worked in sales.',
    'following': 'Please read the following instructions carefully.',
    'additional': 'Are there any additional charges?',
    'major': 'This is a major problem.',
    'minor': 'It\'s only a minor injury. Don\'t worry.',
    'significant': 'There has been a significant improvement.',
    'consider': 'Have you considered other options?',
    'require': 'This job requires a lot of patience.',
    'provide': 'The hotel provides excellent service.',
    'offer': 'They offered me a job in their company.',
    'support': 'We appreciate your continued support.',
    'include': 'Does the price include breakfast?',
    'involve': 'The job involves a lot of traveling.',
    'contain': 'This drink contains no added sugar.',
    'represent': 'The painting represents the artist\'s feelings.',
    'express': 'He found it hard to express his feelings.',
    'announce': 'They announced their engagement yesterday.',
    'mention': 'She didn\'t mention anything about it.',
    'discuss': 'We need to discuss this further.',
    'argue': 'They were arguing about money.',
    'influence': 'Parents influence their children greatly.',
    'affect': 'The weather can affect your mood.',
    'cause': 'What caused the accident?',
    'create': 'She created a beautiful design.',

    // Level 9 - 高中词汇
    'consequence': 'You must accept the consequences of your actions.',
    'significance': 'What is the significance of this discovery?',
    'circumstance': 'Under the circumstances, you did the right thing.',
    'perspective': 'Try to see things from his perspective.',
    'phenomenon': 'Global warming is a worrying phenomenon.',
    'controversy': 'The decision caused a lot of controversy.',
    'legislation': 'The government is introducing new legislation.',
    'discrimination': 'Discrimination on the basis of race is illegal.',
    'contemporary': 'She\'s one of our greatest contemporary artists.',
    'sophisticated': 'They have very sophisticated technology.',
    'controversial': 'This is a highly controversial topic.',
    'fundamental': 'This is a fundamental change in policy.',
    'comprehensive': 'We offer a comprehensive service.',
    'inevitable': 'It was inevitable that he would find out.',
    'substantial': 'They made substantial progress.',
    'relevant': 'Is this information relevant to the case?',
    'efficient': 'We need to find a more efficient way of working.',
    'flexible': 'We need to be flexible about the date.',
    'consistent': 'Her work is consistently good.',
    'appropriate': 'Is this dress appropriate for the occasion?',
    'sufficient': 'We have sufficient evidence to proceed.',
    'essential': 'A good diet is essential for health.',
    'ambitious': 'She\'s very ambitious and works hard.',
    'enthusiastic': 'She\'s enthusiastic about her new job.',
    'apparent': 'It became apparent that he was lying.',
    'obvious': 'It\'s obvious that something is wrong.',
    'potential': 'She has the potential to be a great singer.',
    'ultimate': 'Our ultimate goal is to win the championship.',
    'primary': 'Our primary concern is the safety of the children.',
    'secondary': 'Cost is a secondary consideration.',
    'alternative': 'We need to find an alternative solution.',
    'critical': 'This is a critical moment in the negotiations.',
    'crucial': 'The next few days will be crucial.',
    'urgent': 'This is an urgent matter.',
    'severe': 'The storm caused severe damage.',
    'mild': 'The symptoms are usually mild.',
    'extreme': 'Avoid extreme temperatures.',
    'absolute': 'I have absolute confidence in her abilities.',
    'relative': 'The results are relative to the sample size.',
    'massive': 'They have a massive collection of books.',
    'enormous': 'The house was enormous.',
    'tiny': 'She lives in a tiny apartment.',
    'vast': 'The Sahara is a vast desert.',
    'narrow': 'The road was too narrow for trucks.',
    'broad': 'She has a broad knowledge of the subject.',
    'shallow': 'The water was quite shallow.',
    'profound': 'The experience had a profound effect on him.',
    'abstract': 'Love is an abstract concept.',
    'concrete': 'We need concrete evidence, not just opinions.',
    'precise': 'Please give me the precise details.',
    'accurate': 'His description was accurate in every detail.',
    'approximate': 'Can you give me an approximate figure?',
    'adequate': 'We don\'t have adequate resources.',
    'abundant': 'There was abundant food for everyone.',
    'scarce': 'Fresh water is scarce in the desert.',
    'permanent': 'Is this a permanent or temporary position?',
    'temporary': 'This is only a temporary solution.',
    'annual': 'The company holds an annual meeting every December.',
    'maintain': 'It\'s important to maintain a healthy diet.',
    'obtain': 'Where did you obtain this information?',
    'acquire': 'She acquired a taste for French wine.',
    'achieve': 'She achieved her goal of becoming a doctor.',
    'establish': 'The company was established in 1999.',
    'eliminate': 'We need to eliminate unnecessary costs.',
    'reduce': 'They are trying to reduce costs.',
    'expand': 'The company plans to expand overseas.',
    'extend': 'Can we extend the deadline?',
    'restrict': 'Access to the building is restricted.',
    'distribute': 'The food was distributed to the refugees.',
    'contribute': 'Everyone contributed to the success of the project.',
    'combine': 'Combine the ingredients in a bowl.',
    'distinguish': 'Can you distinguish between the two?',
    'identify': 'Can you identify the problem?',
    'define': 'How would you define success?',
    'interpret': 'How do you interpret this data?',
    'analyze': 'We need to analyze the data carefully.',
    'evaluate': 'We need to evaluate all the options.',
    'estimate': 'I estimate it will take about two hours.',
    'predict': 'It\'s difficult to predict what will happen.',
    'assume': 'I assumed you already knew.',
    'confirm': 'Can you confirm your reservation?',
    'demonstrate': 'The experiment demonstrates the theory.',
    'illustrate': 'Let me illustrate this with an example.',
    'indicate': 'The results indicate a clear trend.',
    'reflect': 'The article reflects public opinion.',
    'reveal': 'The report reveals some interesting facts.',
    'expose': 'The investigation exposed the corruption.',
    'preserve': 'We must preserve our natural resources.',
    'transform': 'The Internet has transformed how we communicate.',
    'convert': 'We need to convert this file to a different format.',

    // Level 10 - 托福词汇
    'meticulous': 'He\'s meticulous about keeping records.',
    'ubiquitous': 'Mobile phones have become ubiquitous.',
    'pragmatic': 'She took a pragmatic approach to the problem.',
    'eloquent': 'She gave an eloquent speech at the ceremony.',
    'ephemeral': 'Fame is often ephemeral.',
    'resilient': 'Children are remarkably resilient.',
    'ambiguous': 'The wording of the contract was ambiguous.',
    'plausible': 'That sounds like a plausible explanation.',
    'incessant': 'The incessant noise made it impossible to sleep.',
    'tenacious': 'She was tenacious in pursuing her goals.',
    'meander': 'The river meanders through the countryside.',
    'ameliorate': 'Steps were taken to ameliorate the situation.',
    'exacerbate': 'The cold weather exacerbated his illness.',
    'corroborate': 'The witness corroborated her story.',
    'unprecedented': 'The flood caused unprecedented damage.',
    'commensurate': 'Her salary is commensurate with her experience.',
    'disseminate': 'The Internet helps disseminate information quickly.',
    'proliferate': 'Fast food chains have proliferated in recent years.',
    'relinquish': 'He was forced to relinquish control of the company.',
    'culminate': 'The festival culminated in a spectacular fireworks display.',
    'exemplify': 'His work exemplifies the best of modern design.',
    'precipitate': 'The crisis precipitated his resignation.',
    'substantiate': 'Can you substantiate your claims with evidence?',
    'juxtapose': 'The exhibition juxtaposes modern and classical art.',
    'scrutinize': 'The contract was scrutinized by lawyers.',
    'articulate': 'She\'s very articulate and speaks well in public.',
    'consolidate': 'The company consolidated its market position.',
    'alleviate': 'The medicine helped to alleviate the pain.',
    'mitigate': 'Measures to mitigate the effects of climate change.',
    'augment': 'She augmented her income by working weekends.',
    'deteriorate': 'Her health has been deteriorating.',
    'expedite': 'We need to expedite the approval process.',
    'impede': 'Progress has been impeded by lack of funding.',
    'facilitate': 'Technology can facilitate communication.',
    'hinder': 'Lack of money hindered the project.',
    'undermine': 'His criticism undermined her confidence.',
    'reinforce': 'The new evidence reinforced their theory.',
    'supersede': 'New technology has superseded the old methods.',
    'perpetuate': 'We must not perpetuate these stereotypes.',
    'eradicate': 'The goal is to eradicate the disease.',
    'pervasive': 'Technology has become pervasive in our lives.',
    'elusive': 'Success remained elusive.',
    'tangible': 'We need to see some tangible results.',
    'intangible': 'The benefits of education are often intangible.',
    'conspicuous': 'He was conspicuous by his absence.',
    'inconspicuous': 'She tried to remain inconspicuous at the party.',
    'ostensible': 'The ostensible reason for the trip was business.',
    'inherent': 'There are inherent risks in the venture.',
    'intrinsic': 'The diamond has little intrinsic value.',
    'extrinsic': 'Her motivation was extrinsic, driven by money.',
    'mundane': 'I spent the day doing mundane tasks.',
    'esoteric': 'The professor discussed esoteric philosophical concepts.',
    'prolific': 'She was a prolific writer.',
    'frugal': 'They lived a frugal life.',
    'lavish': 'They had a lavish wedding ceremony.',
    'austere': 'The room was austere with minimal furniture.',
    'benevolent': 'He was a benevolent employer.',
    'malevolent': 'The villain had a malevolent smile.',
    'altruistic': 'Her motives were purely altruistic.',
    'egocentric': 'He\'s too egocentric to consider others\' feelings.',
    'complacent': 'Don\'t become complacent about your success.',
    'diligent': 'She\'s a diligent student who always does her homework.',
    'lethargic': 'The heat made everyone feel lethargic.',
    'volatile': 'The stock market has been volatile lately.',
    'immutable': 'The laws of physics are immutable.',
    'transient': 'Fame is often transient.',
    'perpetual': 'They lived in a state of perpetual motion.',
    'sporadic': 'There were sporadic outbreaks of violence.',
    'perennial': 'Unemployment is a perennial problem.',
    'nascent': 'The nascent industry is growing rapidly.',
    'obsolete': 'This technology is now obsolete.',
    'archaic': 'The law is archaic and needs updating.',
    'novel': 'That\'s a novel approach to the problem.',
    'orthodox': 'He holds orthodox views on religion.',
    'unorthodox': 'Her teaching methods are rather unorthodox.',
    'empirical': 'There is no empirical evidence to support this theory.',
    'theoretical': 'The theoretical model needs to be tested.',
    'hypothetical': 'Let\'s consider a hypothetical situation.',
    'spurious': 'The article contained spurious claims.',
    'authentic': 'Is this an authentic signature?',
    'covert': 'The government conducted covert operations.',
    'overt': 'There was no overt sign of hostility.',
    'implicit': 'There was an implicit understanding between them.',
    'explicit': 'She gave me explicit instructions.',
    'verbose': 'His writing style is too verbose.',
    'concise': 'Please keep your answer concise.',
    'succinct': 'She gave a succinct summary of the main points.',
    'lucid': 'She gave a lucid explanation of the problem.',
    'cryptic': 'He left a cryptic message that nobody understood.'
  };

  return examples[word.toLowerCase()] || null;
}

/**
 * 生成英文释义（用于英英模式）
 * 仅支持 Level 7-10 的高级词汇
 * @param {string} word - 英文单词
 */
function generateDefinition(word) {
  const definitions = {
    // Level 7 - 小学高年级 (~90词)
    'important': {
      definition: 'having great value or significance',
      wrongDefinitions: ['very small or minor', 'related to time or age']
    },
    'example': {
      definition: 'something that shows what others are like',
      wrongDefinitions: ['a question to be answered', 'a tool for measuring']
    },
    'problem': {
      definition: 'a difficult situation that needs to be solved',
      wrongDefinitions: ['a simple task to complete', 'a celebration event']
    },
    'idea': {
      definition: 'a thought or suggestion in your mind',
      wrongDefinitions: ['a physical object you can touch', 'a type of food']
    },
    'reason': {
      definition: 'the cause or explanation for something',
      wrongDefinitions: ['the final result of an action', 'a type of weather']
    },
    'result': {
      definition: 'something that happens because of an action',
      wrongDefinitions: ['the starting point of something', 'a kind of tool']
    },
    'information': {
      definition: 'facts or details about something',
      wrongDefinitions: ['a type of entertainment', 'a kind of exercise']
    },
    'knowledge': {
      definition: 'facts and skills learned through experience',
      wrongDefinitions: ['a type of building', 'a kind of vehicle']
    },
    'experience': {
      definition: 'knowledge gained from doing something',
      wrongDefinitions: ['a type of food', 'a kind of music']
    },
    'practice': {
      definition: 'doing something repeatedly to improve',
      wrongDefinitions: ['resting and relaxing', 'eating a meal']
    },
    'mistake': {
      definition: 'something done incorrectly or wrong',
      wrongDefinitions: ['something done perfectly', 'a type of celebration']
    },
    'correct': {
      definition: 'right or without errors',
      wrongDefinitions: ['wrong or incorrect', 'uncertain or unclear']
    },
    'possible': {
      definition: 'able to happen or be done',
      wrongDefinitions: ['absolutely certain to happen', 'completely impossible']
    },
    'necessary': {
      definition: 'needed or required',
      wrongDefinitions: ['optional or not needed', 'harmful or dangerous']
    },
    'special': {
      definition: 'different from what is usual or ordinary',
      wrongDefinitions: ['common and everyday', 'boring and dull']
    },
    'popular': {
      definition: 'liked by many people',
      wrongDefinitions: ['disliked by everyone', 'unknown to most people']
    },
    'famous': {
      definition: 'known by many people',
      wrongDefinitions: ['unknown to anyone', 'new and recent']
    },
    'successful': {
      definition: 'achieving the results you wanted',
      wrongDefinitions: ['failing to achieve goals', 'not trying at all']
    },
    'wonderful': {
      definition: 'extremely good or excellent',
      wrongDefinitions: ['terrible and awful', 'ordinary and boring']
    },
    'interesting': {
      definition: 'making you want to know more',
      wrongDefinitions: ['boring and dull', 'scary and frightening']
    },
    'beautiful': {
      definition: 'very pleasing to look at',
      wrongDefinitions: ['ugly and unpleasant', 'loud and noisy']
    },
    'useful': {
      definition: 'helpful for doing something',
      wrongDefinitions: ['harmful and dangerous', 'useless and worthless']
    },
    'useless': {
      definition: 'not helpful or serving no purpose',
      wrongDefinitions: ['very helpful and valuable', 'expensive and rare']
    },
    'common': {
      definition: 'happening often or found in many places',
      wrongDefinitions: ['very rare and unusual', 'expensive and valuable']
    },
    'rare': {
      definition: 'not happening often or hard to find',
      wrongDefinitions: ['very common and ordinary', 'cheap and worthless']
    },
    'excellent': {
      definition: 'extremely good or of high quality',
      wrongDefinitions: ['very bad or poor', 'average and ordinary']
    },
    'perfect': {
      definition: 'having no flaws or mistakes',
      wrongDefinitions: ['full of errors and problems', 'incomplete and unfinished']
    },
    'terrible': {
      definition: 'extremely bad or unpleasant',
      wrongDefinitions: ['wonderful and amazing', 'average and normal']
    },
    'amazing': {
      definition: 'causing great surprise or wonder',
      wrongDefinitions: ['boring and ordinary', 'scary and dangerous']
    },
    'surprising': {
      definition: 'causing feelings of surprise',
      wrongDefinitions: ['expected and predicted', 'boring and dull']
    },
    'exciting': {
      definition: 'causing feelings of enthusiasm',
      wrongDefinitions: ['boring and uninteresting', 'calm and peaceful']
    },
    'boring': {
      definition: 'not interesting or exciting',
      wrongDefinitions: ['fascinating and engaging', 'scary and thrilling']
    },
    'funny': {
      definition: 'causing laughter or amusement',
      wrongDefinitions: ['sad and depressing', 'serious and formal']
    },
    'serious': {
      definition: 'important and needing careful thought',
      wrongDefinitions: ['funny and amusing', 'unimportant and trivial']
    },
    'strange': {
      definition: 'unusual or hard to understand',
      wrongDefinitions: ['normal and ordinary', 'familiar and common']
    },
    'normal': {
      definition: 'usual and expected',
      wrongDefinitions: ['unusual and strange', 'special and unique']
    },
    'crazy': {
      definition: 'very foolish or not sensible',
      wrongDefinitions: ['very sensible and logical', 'calm and peaceful']
    },
    'wise': {
      definition: 'having good judgment and understanding',
      wrongDefinitions: ['foolish and unwise', 'young and inexperienced']
    },
    'foolish': {
      definition: 'lacking good sense or judgment',
      wrongDefinitions: ['very smart and clever', 'careful and cautious']
    },
    'clever': {
      definition: 'quick to understand and learn',
      wrongDefinitions: ['slow to understand', 'unwilling to learn']
    },
    'smart': {
      definition: 'intelligent and able to learn quickly',
      wrongDefinitions: ['slow and unintelligent', 'careless and messy']
    },
    'stupid': {
      definition: 'lacking intelligence or common sense',
      wrongDefinitions: ['very intelligent and wise', 'careful and thoughtful']
    },
    'honest': {
      definition: 'telling the truth and not deceiving',
      wrongDefinitions: ['telling lies frequently', 'hiding information']
    },
    'polite': {
      definition: 'showing good manners and respect',
      wrongDefinitions: ['rude and disrespectful', 'loud and aggressive']
    },
    'rude': {
      definition: 'lacking good manners or respect',
      wrongDefinitions: ['very polite and kind', 'shy and quiet']
    },
    'friendly': {
      definition: 'kind and pleasant to others',
      wrongDefinitions: ['unfriendly and hostile', 'shy and withdrawn']
    },
    'selfish': {
      definition: 'caring only about yourself',
      wrongDefinitions: ['generous and giving', 'caring about others']
    },
    'generous': {
      definition: 'willing to give and share freely',
      wrongDefinitions: ['greedy and selfish', 'poor and needy']
    },
    'patient': {
      definition: 'able to wait calmly without complaining',
      wrongDefinitions: ['easily annoyed or frustrated', 'rushing and hurrying']
    },
    'nervous': {
      definition: 'feeling worried or anxious',
      wrongDefinitions: ['calm and relaxed', 'happy and cheerful']
    },
    'worried': {
      definition: 'feeling anxious about something',
      wrongDefinitions: ['feeling calm and peaceful', 'feeling happy and excited']
    },
    'excited': {
      definition: 'feeling very happy and enthusiastic',
      wrongDefinitions: ['feeling bored and tired', 'feeling sad and unhappy']
    },
    'surprised': {
      definition: 'feeling amazement at something unexpected',
      wrongDefinitions: ['expecting something to happen', 'feeling bored and tired']
    },
    'pleased': {
      definition: 'feeling happy and satisfied',
      wrongDefinitions: ['feeling unhappy and angry', 'feeling bored and tired']
    },
    'disappointed': {
      definition: 'feeling sad because hopes were not met',
      wrongDefinitions: ['feeling very happy and satisfied', 'feeling calm and peaceful']
    },
    'satisfied': {
      definition: 'feeling content with what you have',
      wrongDefinitions: ['feeling unhappy and wanting more', 'feeling angry and upset']
    },
    'bored': {
      definition: 'feeling tired because nothing is interesting',
      wrongDefinitions: ['feeling excited and engaged', 'feeling scared and afraid']
    },
    'interested': {
      definition: 'wanting to know or learn more',
      wrongDefinitions: ['not caring at all', 'feeling scared and afraid']
    },
    'confused': {
      definition: 'unable to understand clearly',
      wrongDefinitions: ['understanding everything perfectly', 'feeling happy and calm']
    },
    'certain': {
      definition: 'completely sure about something',
      wrongDefinitions: ['unsure and doubtful', 'confused and lost']
    },
    'doubt': {
      definition: 'a feeling of not being sure',
      wrongDefinitions: ['complete certainty and confidence', 'happiness and joy']
    },
    'believe': {
      definition: 'to accept something as true',
      wrongDefinitions: ['to refuse to accept something', 'to forget about something']
    },
    'agree': {
      definition: 'to have the same opinion',
      wrongDefinitions: ['to have different opinions', 'to ignore someone']
    },
    'disagree': {
      definition: 'to have a different opinion',
      wrongDefinitions: ['to have the same opinion', 'to not care at all']
    },
    'accept': {
      definition: 'to receive or agree to something',
      wrongDefinitions: ['to refuse or reject something', 'to ignore completely']
    },
    'refuse': {
      definition: 'to say no to something offered',
      wrongDefinitions: ['to say yes to everything', 'to forget about something']
    },
    'allow': {
      definition: 'to give permission for something',
      wrongDefinitions: ['to stop or prevent something', 'to ignore or forget']
    },
    'forbid': {
      definition: 'to not allow something to happen',
      wrongDefinitions: ['to encourage and support', 'to forget about something']
    },
    'promise': {
      definition: 'to say you will definitely do something',
      wrongDefinitions: ['to say you will not do something', 'to forget to do something']
    },
    'decide': {
      definition: 'to choose after thinking carefully',
      wrongDefinitions: ['to be unsure and confused', 'to let others choose for you']
    },
    'choose': {
      definition: 'to pick one thing from several options',
      wrongDefinitions: ['to take everything available', 'to refuse all options']
    },
    'prefer': {
      definition: 'to like one thing more than another',
      wrongDefinitions: ['to dislike everything equally', 'to have no preference']
    },
    'compare': {
      definition: 'to look at similarities and differences',
      wrongDefinitions: ['to ignore all differences', 'to combine things together']
    },
    'describe': {
      definition: 'to tell what something is like',
      wrongDefinitions: ['to hide information about something', 'to destroy something']
    },
    'explain': {
      definition: 'to make something clear or easy to understand',
      wrongDefinitions: ['to make something confusing', 'to hide information']
    },
    'understand': {
      definition: 'to know the meaning of something',
      wrongDefinitions: ['to be confused about something', 'to ignore completely']
    },
    'realize': {
      definition: 'to become aware of something',
      wrongDefinitions: ['to remain unaware of something', 'to forget about something']
    },
    'remember': {
      definition: 'to keep something in your memory',
      wrongDefinitions: ['to forget about something', 'to never know something']
    },
    'forget': {
      definition: 'to not be able to recall something',
      wrongDefinitions: ['to remember everything clearly', 'to learn something new']
    },
    'imagine': {
      definition: 'to form a picture in your mind',
      wrongDefinitions: ['to see something in reality', 'to forget about something']
    },
    'expect': {
      definition: 'to think something will happen',
      wrongDefinitions: ['to be surprised by everything', 'to not think about the future']
    },
    'hope': {
      definition: 'to want something to happen',
      wrongDefinitions: ['to not care what happens', 'to expect bad things']
    },
    'wish': {
      definition: 'to want something that may not happen',
      wrongDefinitions: ['to not want anything', 'to already have everything']
    },
    'succeed': {
      definition: 'to achieve what you wanted',
      wrongDefinitions: ['to fail at something', 'to not try at all']
    },
    'fail': {
      definition: 'to not achieve what you wanted',
      wrongDefinitions: ['to succeed at everything', 'to not try at all']
    },
    'try': {
      definition: 'to make an effort to do something',
      wrongDefinitions: ['to give up without trying', 'to already know how to do']
    },
    'effort': {
      definition: 'the energy you use to do something',
      wrongDefinitions: ['doing nothing at all', 'being lazy and inactive']
    },
    'progress': {
      definition: 'movement toward a better situation',
      wrongDefinitions: ['going backward or getting worse', 'staying exactly the same']
    },
    'improve': {
      definition: 'to make or become better',
      wrongDefinitions: ['to make or become worse', 'to stay exactly the same']
    },

    // Level 8 - 初中词汇 (~90词)
    'environment': {
      definition: 'the natural world around us',
      wrongDefinitions: ['a type of building', 'a kind of food']
    },
    'communication': {
      definition: 'the exchange of information between people',
      wrongDefinitions: ['a type of transportation', 'a kind of sport']
    },
    'technology': {
      definition: 'scientific knowledge used to make machines',
      wrongDefinitions: ['a type of art or music', 'a kind of natural resource']
    },
    'organization': {
      definition: 'a group of people working together',
      wrongDefinitions: ['a single person working alone', 'a type of food']
    },
    'development': {
      definition: 'the process of growing or improving',
      wrongDefinitions: ['the process of getting worse', 'staying the same forever']
    },
    'relationship': {
      definition: 'the connection between people or things',
      wrongDefinitions: ['being completely alone', 'a type of vehicle']
    },
    'competition': {
      definition: 'trying to be more successful than others',
      wrongDefinitions: ['helping others succeed', 'working together as a team']
    },
    'opportunity': {
      definition: 'a chance to do something good',
      wrongDefinitions: ['a problem or difficulty', 'something impossible to do']
    },
    'advantage': {
      definition: 'something that helps you succeed',
      wrongDefinitions: ['something that causes problems', 'a type of disease']
    },
    'disadvantage': {
      definition: 'something that causes problems or difficulties',
      wrongDefinitions: ['something that helps greatly', 'a special benefit']
    },
    'achievement': {
      definition: 'something important you have done',
      wrongDefinitions: ['something you failed to do', 'something very easy']
    },
    'experiment': {
      definition: 'a test to discover something new',
      wrongDefinitions: ['something already known', 'a type of entertainment']
    },
    'explanation': {
      definition: 'words that make something clear',
      wrongDefinitions: ['words that confuse people', 'a type of punishment']
    },
    'description': {
      definition: 'words telling what something is like',
      wrongDefinitions: ['hiding what something is like', 'a type of music']
    },
    'suggestion': {
      definition: 'an idea offered for consideration',
      wrongDefinitions: ['a strict order or command', 'a type of punishment']
    },
    'decision': {
      definition: 'a choice made after thinking',
      wrongDefinitions: ['being unable to choose', 'a type of weather']
    },
    'responsibility': {
      definition: 'a duty to take care of something',
      wrongDefinitions: ['freedom from any duties', 'a type of entertainment']
    },
    'improvement': {
      definition: 'the process of getting better',
      wrongDefinitions: ['the process of getting worse', 'staying exactly the same']
    },
    'conversation': {
      definition: 'a talk between two or more people',
      wrongDefinitions: ['a person talking alone', 'complete silence']
    },
    'imagination': {
      definition: 'the ability to form pictures in your mind',
      wrongDefinitions: ['the inability to think creatively', 'a type of tool']
    },
    'celebration': {
      definition: 'a special event to mark something good',
      wrongDefinitions: ['a sad and serious event', 'an ordinary day']
    },
    'discovery': {
      definition: 'finding something for the first time',
      wrongDefinitions: ['losing something forever', 'forgetting about something']
    },
    'adventure': {
      definition: 'an exciting and risky experience',
      wrongDefinitions: ['a boring and safe experience', 'staying at home always']
    },
    'attendance': {
      definition: 'being present at an event',
      wrongDefinitions: ['being absent from an event', 'a type of food']
    },
    'performance': {
      definition: 'doing something in front of an audience',
      wrongDefinitions: ['doing something alone and hidden', 'sleeping and resting']
    },
    'professional': {
      definition: 'relating to a job requiring special training',
      wrongDefinitions: ['done by beginners or amateurs', 'a type of food']
    },
    'personal': {
      definition: 'belonging to one particular person',
      wrongDefinitions: ['shared by everyone publicly', 'a type of weather']
    },
    'social': {
      definition: 'relating to human society',
      wrongDefinitions: ['relating to being alone', 'a type of animal']
    },
    'political': {
      definition: 'relating to government and public affairs',
      wrongDefinitions: ['relating to cooking and food', 'a type of sport']
    },
    'economic': {
      definition: 'relating to money and business',
      wrongDefinitions: ['relating to art and music', 'a type of weather']
    },
    'cultural': {
      definition: 'relating to art, customs, and way of life',
      wrongDefinitions: ['relating to science and math', 'a type of animal']
    },
    'natural': {
      definition: 'existing in nature, not made by humans',
      wrongDefinitions: ['made by humans artificially', 'a type of machine']
    },
    'artificial': {
      definition: 'made by humans, not natural',
      wrongDefinitions: ['found in nature', 'a type of animal']
    },
    'traditional': {
      definition: 'based on old customs and beliefs',
      wrongDefinitions: ['completely new and modern', 'a type of technology']
    },
    'modern': {
      definition: 'relating to the present time',
      wrongDefinitions: ['relating to ancient times', 'a type of food']
    },
    'ancient': {
      definition: 'belonging to times long ago',
      wrongDefinitions: ['belonging to recent times', 'a type of machine']
    },
    'historical': {
      definition: 'relating to events in the past',
      wrongDefinitions: ['relating to the future only', 'a type of sport']
    },
    'scientific': {
      definition: 'relating to science and research',
      wrongDefinitions: ['relating to art and music', 'a type of food']
    },
    'physical': {
      definition: 'relating to the body or matter',
      wrongDefinitions: ['relating to the mind only', 'a type of music']
    },
    'mental': {
      definition: 'relating to the mind',
      wrongDefinitions: ['relating to the body only', 'a type of sport']
    },
    'emotional': {
      definition: 'relating to feelings',
      wrongDefinitions: ['relating to logic and thinking', 'a type of machine']
    },
    'national': {
      definition: 'relating to a whole country',
      wrongDefinitions: ['relating to one small area', 'a type of food']
    },
    'international': {
      definition: 'involving more than one country',
      wrongDefinitions: ['involving only one country', 'a type of animal']
    },
    'global': {
      definition: 'affecting the whole world',
      wrongDefinitions: ['affecting only one place', 'a type of sport']
    },
    'local': {
      definition: 'relating to a particular area',
      wrongDefinitions: ['relating to the whole world', 'a type of weather']
    },
    'public': {
      definition: 'open for everyone to use or see',
      wrongDefinitions: ['hidden and private', 'a type of animal']
    },
    'private': {
      definition: 'only for one person or group',
      wrongDefinitions: ['open for everyone', 'a type of food']
    },
    'official': {
      definition: 'approved by someone in authority',
      wrongDefinitions: ['not approved by anyone', 'a type of sport']
    },
    'general': {
      definition: 'relating to most things or people',
      wrongDefinitions: ['relating to only one thing', 'a type of animal']
    },
    'specific': {
      definition: 'exact and clearly defined',
      wrongDefinitions: ['vague and unclear', 'a type of weather']
    },
    'particular': {
      definition: 'relating to one specific thing',
      wrongDefinitions: ['relating to everything', 'a type of food']
    },
    'original': {
      definition: 'first or earliest; not a copy',
      wrongDefinitions: ['copied from something else', 'a type of machine']
    },
    'basic': {
      definition: 'fundamental or essential',
      wrongDefinitions: ['complex and advanced', 'a type of sport']
    },
    'advanced': {
      definition: 'at a high level of development',
      wrongDefinitions: ['at a basic beginner level', 'a type of food']
    },
    'average': {
      definition: 'typical or in the middle',
      wrongDefinitions: ['extremely unusual', 'a type of animal']
    },
    'regular': {
      definition: 'happening at the same time',
      wrongDefinitions: ['happening randomly', 'a type of weather']
    },
    'frequent': {
      definition: 'happening often',
      wrongDefinitions: ['happening rarely', 'a type of sport']
    },
    'constant': {
      definition: 'happening all the time without stopping',
      wrongDefinitions: ['happening only once', 'a type of food']
    },
    'various': {
      definition: 'of many different types',
      wrongDefinitions: ['all exactly the same', 'a type of machine']
    },
    'entire': {
      definition: 'whole and complete',
      wrongDefinitions: ['only a small part', 'a type of animal']
    },
    'complete': {
      definition: 'having all necessary parts',
      wrongDefinitions: ['missing important parts', 'a type of weather']
    },
    'separate': {
      definition: 'not joined or connected',
      wrongDefinitions: ['joined or connected together', 'a type of sport']
    },
    'independent': {
      definition: 'not controlled by others',
      wrongDefinitions: ['controlled by others completely', 'a type of food']
    },
    'available': {
      definition: 'ready to use or obtain',
      wrongDefinitions: ['not able to be used', 'a type of music']
    },
    'recent': {
      definition: 'happening a short time ago',
      wrongDefinitions: ['happening long ago', 'a type of animal']
    },
    'current': {
      definition: 'happening or existing now',
      wrongDefinitions: ['happening in the past only', 'a type of weather']
    },
    'previous': {
      definition: 'happening before now',
      wrongDefinitions: ['happening in the future', 'a type of sport']
    },
    'following': {
      definition: 'coming after something else',
      wrongDefinitions: ['coming before something', 'a type of food']
    },
    'additional': {
      definition: 'extra or more than expected',
      wrongDefinitions: ['less than expected', 'a type of machine']
    },
    'major': {
      definition: 'very large or important',
      wrongDefinitions: ['very small or unimportant', 'a type of animal']
    },
    'minor': {
      definition: 'not very large or important',
      wrongDefinitions: ['very large or important', 'a type of weather']
    },
    'significant': {
      definition: 'important enough to have an effect',
      wrongDefinitions: ['too small to matter', 'a type of sport']
    },
    'consider': {
      definition: 'to think about carefully',
      wrongDefinitions: ['to ignore completely', 'a type of food']
    },
    'require': {
      definition: 'to need something',
      wrongDefinitions: ['to not need anything', 'a type of music']
    },
    'provide': {
      definition: 'to give or supply something',
      wrongDefinitions: ['to take or remove something', 'a type of animal']
    },
    'offer': {
      definition: 'to present something for acceptance',
      wrongDefinitions: ['to refuse to give anything', 'a type of weather']
    },
    'support': {
      definition: 'to help or encourage',
      wrongDefinitions: ['to work against', 'a type of sport']
    },
    'include': {
      definition: 'to contain as part of something',
      wrongDefinitions: ['to leave out', 'a type of food']
    },
    'involve': {
      definition: 'to be part of an activity',
      wrongDefinitions: ['to stay completely separate', 'a type of machine']
    },
    'contain': {
      definition: 'to have something inside',
      wrongDefinitions: ['to be completely empty', 'a type of animal']
    },
    'represent': {
      definition: 'to stand for or act for',
      wrongDefinitions: ['to hide or conceal', 'a type of weather']
    },
    'express': {
      definition: 'to show thoughts or feelings',
      wrongDefinitions: ['to hide thoughts or feelings', 'a type of sport']
    },
    'announce': {
      definition: 'to make something publicly known',
      wrongDefinitions: ['to keep something secret', 'a type of food']
    },
    'mention': {
      definition: 'to speak briefly about',
      wrongDefinitions: ['to never talk about', 'a type of music']
    },
    'discuss': {
      definition: 'to talk about in detail',
      wrongDefinitions: ['to remain silent about', 'a type of animal']
    },
    'argue': {
      definition: 'to disagree and give reasons',
      wrongDefinitions: ['to agree with everything', 'a type of weather']
    },
    'influence': {
      definition: 'to have an effect on',
      wrongDefinitions: ['to have no effect on', 'a type of sport']
    },
    'affect': {
      definition: 'to make a change in',
      wrongDefinitions: ['to keep exactly the same', 'a type of food']
    },
    'cause': {
      definition: 'to make something happen',
      wrongDefinitions: ['to prevent something', 'a type of machine']
    },
    'create': {
      definition: 'to make something new',
      wrongDefinitions: ['to destroy something', 'a type of animal']
    },

    // Level 9 - 高中词汇 (~90词)
    'consequence': {
      definition: 'a result of an action or situation',
      wrongDefinitions: ['the cause of something', 'a type of food']
    },
    'significance': {
      definition: 'the quality of being important',
      wrongDefinitions: ['the quality of being unimportant', 'a type of animal']
    },
    'circumstance': {
      definition: 'the conditions around an event',
      wrongDefinitions: ['a type of weather', 'a kind of sport']
    },
    'perspective': {
      definition: 'a way of thinking about something',
      wrongDefinitions: ['a type of food', 'a kind of building']
    },
    'phenomenon': {
      definition: 'something observed to happen or exist',
      wrongDefinitions: ['something that never happens', 'a type of machine']
    },
    'controversy': {
      definition: 'public disagreement about something',
      wrongDefinitions: ['complete public agreement', 'a type of sport']
    },
    'legislation': {
      definition: 'laws made by a government',
      wrongDefinitions: ['a type of entertainment', 'a kind of food']
    },
    'discrimination': {
      definition: 'unfair treatment based on differences',
      wrongDefinitions: ['fair and equal treatment', 'a type of music']
    },
    'contemporary': {
      definition: 'belonging to the present time',
      wrongDefinitions: ['belonging to ancient times', 'a type of animal']
    },
    'sophisticated': {
      definition: 'complex and advanced',
      wrongDefinitions: ['simple and basic', 'a type of food']
    },
    'controversial': {
      definition: 'causing public disagreement',
      wrongDefinitions: ['causing public agreement', 'a type of sport']
    },
    'fundamental': {
      definition: 'basic and essential',
      wrongDefinitions: ['unnecessary and optional', 'a type of weather']
    },
    'comprehensive': {
      definition: 'including all or most parts',
      wrongDefinitions: ['including only a small part', 'a type of animal']
    },
    'inevitable': {
      definition: 'certain to happen, unavoidable',
      wrongDefinitions: ['completely avoidable', 'a type of food']
    },
    'substantial': {
      definition: 'large in amount or importance',
      wrongDefinitions: ['small and unimportant', 'a type of music']
    },
    'relevant': {
      definition: 'connected to what is being discussed',
      wrongDefinitions: ['completely unrelated', 'a type of sport']
    },
    'efficient': {
      definition: 'working well without wasting time',
      wrongDefinitions: ['slow and wasteful', 'a type of weather']
    },
    'flexible': {
      definition: 'able to change or bend easily',
      wrongDefinitions: ['rigid and unchangeable', 'a type of animal']
    },
    'consistent': {
      definition: 'always behaving the same way',
      wrongDefinitions: ['always changing unpredictably', 'a type of food']
    },
    'appropriate': {
      definition: 'suitable for a particular situation',
      wrongDefinitions: ['completely unsuitable', 'a type of music']
    },
    'sufficient': {
      definition: 'enough for a particular purpose',
      wrongDefinitions: ['not enough at all', 'a type of sport']
    },
    'essential': {
      definition: 'absolutely necessary',
      wrongDefinitions: ['completely unnecessary', 'a type of weather']
    },
    'ambitious': {
      definition: 'having a strong desire to succeed',
      wrongDefinitions: ['having no desire to succeed', 'a type of animal']
    },
    'enthusiastic': {
      definition: 'showing great excitement and interest',
      wrongDefinitions: ['showing no interest at all', 'a type of food']
    },
    'apparent': {
      definition: 'clearly visible or understood',
      wrongDefinitions: ['hidden and unclear', 'a type of music']
    },
    'obvious': {
      definition: 'easy to see or understand',
      wrongDefinitions: ['difficult to see or understand', 'a type of sport']
    },
    'potential': {
      definition: 'possible but not yet achieved',
      wrongDefinitions: ['impossible to achieve', 'a type of weather']
    },
    'ultimate': {
      definition: 'final or most important',
      wrongDefinitions: ['first or least important', 'a type of animal']
    },
    'primary': {
      definition: 'most important or main',
      wrongDefinitions: ['least important or minor', 'a type of food']
    },
    'secondary': {
      definition: 'less important than the main thing',
      wrongDefinitions: ['most important of all', 'a type of music']
    },
    'alternative': {
      definition: 'another choice or option',
      wrongDefinitions: ['the only possible choice', 'a type of sport']
    },
    'critical': {
      definition: 'extremely important',
      wrongDefinitions: ['not important at all', 'a type of weather']
    },
    'crucial': {
      definition: 'of great importance',
      wrongDefinitions: ['of no importance', 'a type of animal']
    },
    'urgent': {
      definition: 'requiring immediate action',
      wrongDefinitions: ['not needing any action', 'a type of food']
    },
    'severe': {
      definition: 'very serious or harsh',
      wrongDefinitions: ['very mild and gentle', 'a type of music']
    },
    'mild': {
      definition: 'not severe or strong',
      wrongDefinitions: ['extremely severe or harsh', 'a type of sport']
    },
    'extreme': {
      definition: 'very great in degree',
      wrongDefinitions: ['very moderate or mild', 'a type of weather']
    },
    'absolute': {
      definition: 'complete and total',
      wrongDefinitions: ['partial and incomplete', 'a type of animal']
    },
    'relative': {
      definition: 'considered in relation to something',
      wrongDefinitions: ['completely independent of anything', 'a type of food']
    },
    'massive': {
      definition: 'extremely large and heavy',
      wrongDefinitions: ['extremely small and light', 'a type of music']
    },
    'enormous': {
      definition: 'very large in size',
      wrongDefinitions: ['very small in size', 'a type of sport']
    },
    'tiny': {
      definition: 'extremely small',
      wrongDefinitions: ['extremely large', 'a type of weather']
    },
    'vast': {
      definition: 'extremely large in area',
      wrongDefinitions: ['extremely small in area', 'a type of animal']
    },
    'narrow': {
      definition: 'small in width',
      wrongDefinitions: ['very wide', 'a type of food']
    },
    'broad': {
      definition: 'wide from side to side',
      wrongDefinitions: ['very narrow', 'a type of music']
    },
    'shallow': {
      definition: 'not deep',
      wrongDefinitions: ['very deep', 'a type of sport']
    },
    'profound': {
      definition: 'very deep or intense',
      wrongDefinitions: ['very shallow or light', 'a type of weather']
    },
    'abstract': {
      definition: 'existing only as an idea',
      wrongDefinitions: ['physical and touchable', 'a type of animal']
    },
    'concrete': {
      definition: 'real and specific',
      wrongDefinitions: ['imaginary and vague', 'a type of food']
    },
    'precise': {
      definition: 'exact and accurate',
      wrongDefinitions: ['vague and inaccurate', 'a type of music']
    },
    'accurate': {
      definition: 'correct and without errors',
      wrongDefinitions: ['incorrect and full of errors', 'a type of sport']
    },
    'approximate': {
      definition: 'close but not exact',
      wrongDefinitions: ['exactly precise', 'a type of weather']
    },
    'adequate': {
      definition: 'enough for a particular purpose',
      wrongDefinitions: ['not nearly enough', 'a type of animal']
    },
    'abundant': {
      definition: 'existing in large quantities',
      wrongDefinitions: ['existing in small quantities', 'a type of food']
    },
    'scarce': {
      definition: 'not enough to meet demand',
      wrongDefinitions: ['more than enough', 'a type of music']
    },
    'permanent': {
      definition: 'lasting forever or for a long time',
      wrongDefinitions: ['lasting only briefly', 'a type of sport']
    },
    'temporary': {
      definition: 'lasting for a short time only',
      wrongDefinitions: ['lasting forever', 'a type of weather']
    },
    'annual': {
      definition: 'happening once every year',
      wrongDefinitions: ['happening every day', 'a type of animal']
    },
    'maintain': {
      definition: 'to keep something in good condition',
      wrongDefinitions: ['to let something fall apart', 'a type of food']
    },
    'obtain': {
      definition: 'to get or acquire something',
      wrongDefinitions: ['to lose or give away', 'a type of music']
    },
    'acquire': {
      definition: 'to gain or get something',
      wrongDefinitions: ['to lose or give up', 'a type of sport']
    },
    'achieve': {
      definition: 'to succeed in reaching a goal',
      wrongDefinitions: ['to fail to reach a goal', 'a type of weather']
    },
    'establish': {
      definition: 'to set up or create',
      wrongDefinitions: ['to destroy or end', 'a type of animal']
    },
    'eliminate': {
      definition: 'to remove or get rid of',
      wrongDefinitions: ['to add or include', 'a type of food']
    },
    'reduce': {
      definition: 'to make smaller or less',
      wrongDefinitions: ['to make larger or more', 'a type of music']
    },
    'expand': {
      definition: 'to become larger or wider',
      wrongDefinitions: ['to become smaller', 'a type of sport']
    },
    'extend': {
      definition: 'to make longer or bigger',
      wrongDefinitions: ['to make shorter or smaller', 'a type of weather']
    },
    'restrict': {
      definition: 'to limit or control',
      wrongDefinitions: ['to allow freely', 'a type of animal']
    },
    'distribute': {
      definition: 'to give out to many people',
      wrongDefinitions: ['to keep for yourself', 'a type of food']
    },
    'contribute': {
      definition: 'to give or help toward something',
      wrongDefinitions: ['to take away from', 'a type of music']
    },
    'combine': {
      definition: 'to join together',
      wrongDefinitions: ['to separate apart', 'a type of sport']
    },
    'distinguish': {
      definition: 'to tell the difference between',
      wrongDefinitions: ['to confuse or mix up', 'a type of weather']
    },
    'identify': {
      definition: 'to recognize or name',
      wrongDefinitions: ['to fail to recognize', 'a type of animal']
    },
    'define': {
      definition: 'to explain the meaning of',
      wrongDefinitions: ['to leave unexplained', 'a type of food']
    },
    'interpret': {
      definition: 'to explain the meaning of',
      wrongDefinitions: ['to misunderstand completely', 'a type of music']
    },
    'analyze': {
      definition: 'to examine in detail',
      wrongDefinitions: ['to ignore completely', 'a type of sport']
    },
    'evaluate': {
      definition: 'to judge the value of',
      wrongDefinitions: ['to ignore the value of', 'a type of weather']
    },
    'estimate': {
      definition: 'to guess approximately',
      wrongDefinitions: ['to know exactly', 'a type of animal']
    },
    'predict': {
      definition: 'to say what will happen',
      wrongDefinitions: ['to remember what happened', 'a type of food']
    },
    'assume': {
      definition: 'to accept as true without proof',
      wrongDefinitions: ['to prove beyond doubt', 'a type of music']
    },
    'confirm': {
      definition: 'to prove something is true',
      wrongDefinitions: ['to prove something is false', 'a type of sport']
    },
    'demonstrate': {
      definition: 'to show how something works',
      wrongDefinitions: ['to hide how something works', 'a type of weather']
    },
    'illustrate': {
      definition: 'to explain with examples',
      wrongDefinitions: ['to confuse with complexity', 'a type of animal']
    },
    'indicate': {
      definition: 'to show or point out',
      wrongDefinitions: ['to hide or conceal', 'a type of food']
    },
    'reflect': {
      definition: 'to show or express',
      wrongDefinitions: ['to hide or suppress', 'a type of music']
    },
    'reveal': {
      definition: 'to make known or visible',
      wrongDefinitions: ['to keep hidden', 'a type of sport']
    },
    'expose': {
      definition: 'to uncover or make visible',
      wrongDefinitions: ['to cover up or hide', 'a type of weather']
    },
    'preserve': {
      definition: 'to keep safe from harm',
      wrongDefinitions: ['to destroy or damage', 'a type of animal']
    },
    'transform': {
      definition: 'to change completely',
      wrongDefinitions: ['to keep exactly the same', 'a type of food']
    },
    'convert': {
      definition: 'to change from one form to another',
      wrongDefinitions: ['to keep in the same form', 'a type of music']
    },

    // Level 10 - 托福词汇 (~90词)
    'meticulous': {
      definition: 'showing great attention to detail',
      wrongDefinitions: ['careless and sloppy', 'a type of food']
    },
    'ubiquitous': {
      definition: 'present everywhere at once',
      wrongDefinitions: ['found in only one place', 'a type of animal']
    },
    'pragmatic': {
      definition: 'dealing with things sensibly',
      wrongDefinitions: ['dealing with things unrealistically', 'a type of sport']
    },
    'eloquent': {
      definition: 'fluent and persuasive in speaking',
      wrongDefinitions: ['unable to speak clearly', 'a type of weather']
    },
    'ephemeral': {
      definition: 'lasting for a very short time',
      wrongDefinitions: ['lasting forever', 'a type of food']
    },
    'resilient': {
      definition: 'able to recover from difficulties',
      wrongDefinitions: ['unable to recover from problems', 'a type of music']
    },
    'ambiguous': {
      definition: 'having more than one meaning',
      wrongDefinitions: ['having only one clear meaning', 'a type of sport']
    },
    'plausible': {
      definition: 'seeming reasonable or probable',
      wrongDefinitions: ['completely impossible', 'a type of weather']
    },
    'incessant': {
      definition: 'continuing without pause',
      wrongDefinitions: ['happening only occasionally', 'a type of animal']
    },
    'tenacious': {
      definition: 'holding firmly to something',
      wrongDefinitions: ['giving up easily', 'a type of food']
    },
    'meander': {
      definition: 'to follow a winding path',
      wrongDefinitions: ['to go in a straight line', 'a type of music']
    },
    'ameliorate': {
      definition: 'to make something better',
      wrongDefinitions: ['to make something worse', 'a type of sport']
    },
    'exacerbate': {
      definition: 'to make a problem worse',
      wrongDefinitions: ['to make a problem better', 'a type of weather']
    },
    'corroborate': {
      definition: 'to confirm or support with evidence',
      wrongDefinitions: ['to deny or contradict', 'a type of animal']
    },
    'unprecedented': {
      definition: 'never done or known before',
      wrongDefinitions: ['very common and ordinary', 'a type of food']
    },
    'commensurate': {
      definition: 'corresponding in size or degree',
      wrongDefinitions: ['completely unrelated in size', 'a type of music']
    },
    'disseminate': {
      definition: 'to spread information widely',
      wrongDefinitions: ['to keep information secret', 'a type of sport']
    },
    'proliferate': {
      definition: 'to increase rapidly in number',
      wrongDefinitions: ['to decrease in number', 'a type of weather']
    },
    'relinquish': {
      definition: 'to give up or let go',
      wrongDefinitions: ['to hold on tightly', 'a type of animal']
    },
    'culminate': {
      definition: 'to reach the highest point',
      wrongDefinitions: ['to reach the lowest point', 'a type of food']
    },
    'exemplify': {
      definition: 'to serve as a typical example',
      wrongDefinitions: ['to be completely unique', 'a type of music']
    },
    'precipitate': {
      definition: 'to cause to happen suddenly',
      wrongDefinitions: ['to prevent from happening', 'a type of sport']
    },
    'substantiate': {
      definition: 'to provide evidence for',
      wrongDefinitions: ['to disprove with evidence', 'a type of weather']
    },
    'juxtapose': {
      definition: 'to place close together for comparison',
      wrongDefinitions: ['to keep far apart', 'a type of animal']
    },
    'scrutinize': {
      definition: 'to examine very carefully',
      wrongDefinitions: ['to glance at briefly', 'a type of food']
    },
    'articulate': {
      definition: 'to express ideas clearly',
      wrongDefinitions: ['to speak unclearly', 'a type of music']
    },
    'consolidate': {
      definition: 'to combine into a single unit',
      wrongDefinitions: ['to split into many parts', 'a type of sport']
    },
    'alleviate': {
      definition: 'to make suffering less severe',
      wrongDefinitions: ['to make suffering worse', 'a type of weather']
    },
    'mitigate': {
      definition: 'to make less severe or serious',
      wrongDefinitions: ['to make more severe', 'a type of animal']
    },
    'augment': {
      definition: 'to make greater in size',
      wrongDefinitions: ['to make smaller', 'a type of food']
    },
    'deteriorate': {
      definition: 'to become progressively worse',
      wrongDefinitions: ['to become progressively better', 'a type of music']
    },
    'expedite': {
      definition: 'to make something happen faster',
      wrongDefinitions: ['to make something happen slower', 'a type of sport']
    },
    'impede': {
      definition: 'to slow down or prevent progress',
      wrongDefinitions: ['to speed up progress', 'a type of weather']
    },
    'facilitate': {
      definition: 'to make an action easier',
      wrongDefinitions: ['to make an action harder', 'a type of animal']
    },
    'hinder': {
      definition: 'to create difficulties for',
      wrongDefinitions: ['to help and support', 'a type of food']
    },
    'undermine': {
      definition: 'to weaken or damage gradually',
      wrongDefinitions: ['to strengthen gradually', 'a type of music']
    },
    'reinforce': {
      definition: 'to make stronger',
      wrongDefinitions: ['to make weaker', 'a type of sport']
    },
    'supersede': {
      definition: 'to replace with something newer',
      wrongDefinitions: ['to keep the old thing', 'a type of weather']
    },
    'perpetuate': {
      definition: 'to make something continue forever',
      wrongDefinitions: ['to make something end', 'a type of animal']
    },
    'eradicate': {
      definition: 'to destroy completely',
      wrongDefinitions: ['to create or build', 'a type of food']
    },
    'pervasive': {
      definition: 'spreading throughout an area',
      wrongDefinitions: ['limited to one small area', 'a type of music']
    },
    'elusive': {
      definition: 'difficult to find or catch',
      wrongDefinitions: ['easy to find', 'a type of sport']
    },
    'tangible': {
      definition: 'able to be touched or felt',
      wrongDefinitions: ['unable to be touched', 'a type of weather']
    },
    'intangible': {
      definition: 'unable to be touched',
      wrongDefinitions: ['able to be touched', 'a type of animal']
    },
    'conspicuous': {
      definition: 'easily seen or noticed',
      wrongDefinitions: ['hard to see or notice', 'a type of food']
    },
    'inconspicuous': {
      definition: 'not easily noticed',
      wrongDefinitions: ['very easily noticed', 'a type of music']
    },
    'ostensible': {
      definition: 'appearing to be true but possibly not',
      wrongDefinitions: ['definitely and certainly true', 'a type of sport']
    },
    'inherent': {
      definition: 'existing as a natural part',
      wrongDefinitions: ['added from outside', 'a type of weather']
    },
    'intrinsic': {
      definition: 'belonging naturally to something',
      wrongDefinitions: ['coming from outside', 'a type of animal']
    },
    'extrinsic': {
      definition: 'coming from outside',
      wrongDefinitions: ['coming from inside', 'a type of food']
    },
    'mundane': {
      definition: 'ordinary and not interesting',
      wrongDefinitions: ['exciting and unusual', 'a type of music']
    },
    'esoteric': {
      definition: 'understood by only a few people',
      wrongDefinitions: ['understood by everyone', 'a type of sport']
    },
    'prolific': {
      definition: 'producing many works or results',
      wrongDefinitions: ['producing very little', 'a type of weather']
    },
    'frugal': {
      definition: 'careful not to waste money',
      wrongDefinitions: ['spending money freely', 'a type of animal']
    },
    'lavish': {
      definition: 'very rich and expensive',
      wrongDefinitions: ['very simple and cheap', 'a type of food']
    },
    'austere': {
      definition: 'severe and without comfort',
      wrongDefinitions: ['comfortable and luxurious', 'a type of music']
    },
    'benevolent': {
      definition: 'kind and wanting to help',
      wrongDefinitions: ['cruel and harmful', 'a type of sport']
    },
    'malevolent': {
      definition: 'wanting to cause harm',
      wrongDefinitions: ['wanting to help others', 'a type of weather']
    },
    'altruistic': {
      definition: 'caring about others unselfishly',
      wrongDefinitions: ['caring only about yourself', 'a type of animal']
    },
    'egocentric': {
      definition: 'thinking only about yourself',
      wrongDefinitions: ['thinking about others first', 'a type of food']
    },
    'complacent': {
      definition: 'satisfied and not wanting to improve',
      wrongDefinitions: ['always wanting to improve', 'a type of music']
    },
    'diligent': {
      definition: 'working hard and carefully',
      wrongDefinitions: ['lazy and careless', 'a type of sport']
    },
    'lethargic': {
      definition: 'lacking energy and enthusiasm',
      wrongDefinitions: ['full of energy', 'a type of weather']
    },
    'volatile': {
      definition: 'likely to change suddenly',
      wrongDefinitions: ['stable and unchanging', 'a type of animal']
    },
    'immutable': {
      definition: 'unable to be changed',
      wrongDefinitions: ['easily changed', 'a type of food']
    },
    'transient': {
      definition: 'lasting for only a short time',
      wrongDefinitions: ['lasting forever', 'a type of music']
    },
    'perpetual': {
      definition: 'never ending or changing',
      wrongDefinitions: ['ending very quickly', 'a type of sport']
    },
    'sporadic': {
      definition: 'happening at irregular intervals',
      wrongDefinitions: ['happening regularly', 'a type of weather']
    },
    'perennial': {
      definition: 'lasting for a long time',
      wrongDefinitions: ['lasting only briefly', 'a type of animal']
    },
    'nascent': {
      definition: 'just beginning to develop',
      wrongDefinitions: ['fully developed and mature', 'a type of food']
    },
    'obsolete': {
      definition: 'no longer used or useful',
      wrongDefinitions: ['brand new and modern', 'a type of music']
    },
    'archaic': {
      definition: 'very old and no longer used',
      wrongDefinitions: ['modern and new', 'a type of sport']
    },
    'novel': {
      definition: 'new and different from before',
      wrongDefinitions: ['old and traditional', 'a type of weather']
    },
    'orthodox': {
      definition: 'following traditional beliefs',
      wrongDefinitions: ['rejecting all traditions', 'a type of animal']
    },
    'unorthodox': {
      definition: 'different from what is usual',
      wrongDefinitions: ['completely traditional', 'a type of food']
    },
    'empirical': {
      definition: 'based on observation and experience',
      wrongDefinitions: ['based on theory only', 'a type of music']
    },
    'theoretical': {
      definition: 'based on ideas rather than practice',
      wrongDefinitions: ['based on real experience', 'a type of sport']
    },
    'hypothetical': {
      definition: 'imagined rather than real',
      wrongDefinitions: ['completely real and proven', 'a type of weather']
    },
    'spurious': {
      definition: 'not genuine or authentic',
      wrongDefinitions: ['completely genuine', 'a type of animal']
    },
    'authentic': {
      definition: 'genuine and real',
      wrongDefinitions: ['fake and false', 'a type of food']
    },
    'covert': {
      definition: 'hidden and secret',
      wrongDefinitions: ['open and public', 'a type of music']
    },
    'overt': {
      definition: 'done openly without hiding',
      wrongDefinitions: ['done in secret', 'a type of sport']
    },
    'implicit': {
      definition: 'suggested but not directly stated',
      wrongDefinitions: ['clearly and directly stated', 'a type of weather']
    },
    'explicit': {
      definition: 'stated clearly and directly',
      wrongDefinitions: ['hidden and unclear', 'a type of animal']
    },
    'verbose': {
      definition: 'using more words than needed',
      wrongDefinitions: ['using very few words', 'a type of food']
    },
    'concise': {
      definition: 'expressing much in few words',
      wrongDefinitions: ['using too many words', 'a type of music']
    },
    'succinct': {
      definition: 'briefly and clearly expressed',
      wrongDefinitions: ['long and wordy', 'a type of sport']
    },
    'lucid': {
      definition: 'easy to understand',
      wrongDefinitions: ['confusing and unclear', 'a type of weather']
    },
    'cryptic': {
      definition: 'having a hidden meaning',
      wrongDefinitions: ['having an obvious meaning', 'a type of animal']
    }
  };

  return definitions[word.toLowerCase()] || null;
}

/**
 * 生成标签
 * @param {object} word - 单词对象
 * @param {number} level - 级别
 */
function generateTags(word, level) {
  const tags = [];

  // 根据级别添加标签
  const levelTags = {
    0: ['基础', '入门'],
    1: ['名词', '常见'],
    2: ['动词', '日常'],
    3: ['家庭', '身体'],
    4: ['用品', '地点'],
    5: ['自然', '天气', '时间'],
    6: ['小学', '形容词'],
    7: ['小学高年级'],
    8: ['初中'],
    9: ['高中'],
    10: ['托福', '高级']
  };

  if (levelTags[level]) {
    tags.push(levelTags[level][0]);
  }

  return tags;
}

// 页面加载时初始化
if (typeof window !== 'undefined') {
  // 等待 wordDatabase 加载
  if (typeof wordDatabase !== 'undefined') {
    initWordDataFromLegacy();
  } else {
    // 如果 wordDatabase 还没加载，等待 DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof wordDatabase !== 'undefined') {
        initWordDataFromLegacy();
      }
    });
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { wordData_en_zh, initWordDataFromLegacy };
}
