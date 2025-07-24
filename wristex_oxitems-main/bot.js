import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';


const TOKEN = 'BOT_TOKENINIZI_BURAYA_YAZIN'; 
const CLIENT_ID = 'BOT_CLIENT_ID'; 
const AUTHORIZED_IDS = ['1234567898012345678980', '1234567898012345678980']; // Komutu kullanabilecek Discord kullanıcı ID'leri
// Aşağıdaki yolu kendi sunucu dizinine göre düzenleyin:
const OX_INVENTORY_PATH = path.join(process.cwd(), '..', '[ox]', 'ox_inventory');
const ITEMS_PATH = path.join(OX_INVENTORY_PATH, 'data', 'items.lua');
const IMAGES_DIR = path.join(OX_INVENTORY_PATH, 'web', 'images');

fs.mkdirSync(path.join(OX_INVENTORY_PATH, 'data'), { recursive: true });
fs.mkdirSync(IMAGES_DIR, { recursive: true });


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const createItemsCommand = new SlashCommandBuilder()
  .setName('create-items')
  .setDescription('Yeni bir item ekle')
  .addStringOption(opt => opt.setName('item_name').setDescription('Item adı').setRequired(true))
  .addStringOption(opt => opt.setName('label').setDescription('Label').setRequired(true))
  .addIntegerOption(opt => opt.setName('weight').setDescription('Weight').setRequired(true))
  .addBooleanOption(opt => opt.setName('stack').setDescription('Stack (true/false)').setRequired(true))
  .addBooleanOption(opt => opt.setName('close').setDescription('Close (true/false)').setRequired(true))
  .addStringOption(opt => opt.setName('description').setDescription('Açıklama').setRequired(false))
  .addStringOption(opt => opt.setName('gorsel_url').setDescription('Görsel URL').setRequired(false));

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: [createItemsCommand.toJSON()] }
  );
  console.log('Slash komutları yüklendi.');
}

client.once('ready', () => {
  console.log(`Bot giriş yaptı: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'create-items') return;

  if (!AUTHORIZED_IDS.includes(interaction.user.id)) {
    await interaction.reply({ content: 'Bu komutu kullanmaya yetkin yok.', ephemeral: true });
    return;
  }

  const itemName = interaction.options.getString('item_name');
  const label = interaction.options.getString('label');
  const weight = interaction.options.getInteger('weight');
  const stack = interaction.options.getBoolean('stack');
  const close = interaction.options.getBoolean('close');
  const description = interaction.options.getString('description') || "";
  const gorselUrl = interaction.options.getString('gorsel_url');

 
  let imageFileName = '';
  if (gorselUrl) {
    try {
      const res = await fetch(gorselUrl);
      if (!res.ok) throw new Error('Görsel indirilemedi');
      const ext = path.extname(new URL(gorselUrl).pathname) || '.png';
      imageFileName = `${itemName}${ext}`;
      const imagePath = path.join(IMAGES_DIR, imageFileName);
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(imagePath, Buffer.from(buffer));
    } catch (err) {
      await interaction.reply({ content: 'Görsel indirilemedi: ' + err.message, ephemeral: true });
      return;
    }
  }

  
  let itemLua = `  ["${itemName}"] = {\n` +
    `    label = "${label}",\n` +
    `    weight = ${weight},\n` +
    `    stack = ${stack},\n` +
    `    close = ${close},\n` +
    `    description = "${description}",\n` +
    `    client = {\n` +
    `      image = "${imageFileName || gorselUrl || ''}",\n` +
    `    }\n` +
    `  },\n`;

  try {
    let fileContent = '';
    if (fs.existsSync(ITEMS_PATH)) {
      fileContent = fs.readFileSync(ITEMS_PATH, 'utf8');
      
      const insertIndex = fileContent.lastIndexOf('}');
      if (insertIndex !== -1) {
        fileContent = fileContent.slice(0, insertIndex) + '\n' + itemLua + fileContent.slice(insertIndex);
      } else {
        
        fileContent = 'return {\n' + itemLua + '\n}';
      }
    } else {
      fileContent = 'return {\n' + itemLua + '\n}';
    }
    fs.writeFileSync(ITEMS_PATH, fileContent, 'utf8');
    await interaction.reply({ content: 'Item başarıyla eklendi!', ephemeral: true });
  } catch (err) {
    await interaction.reply({ content: 'items.lua yazılamadı: ' + err.message, ephemeral: true });
  }
});


registerCommands();
client.login(TOKEN); 