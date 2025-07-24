import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Events } from 'discord.js';
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
  .setDescription('Yeni bir item oluşturma formu gönderir.');

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
  if (interaction.isChatInputCommand() && interaction.commandName === 'create-items') {
    if (!AUTHORIZED_IDS.includes(interaction.user.id)) {
      await interaction.reply({ content: 'Bu komutu kullanmaya yetkin yok.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Item Oluşturma Sistemi')
      .setDescription('Aşağıdaki butona tıklayarak yeni bir item oluşturabilirsin.');
    const button = new ButtonBuilder()
      .setCustomId('open_item_modal')
      .setLabel('Item Oluştur')
      .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(button);
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
    return;
  }


  if (interaction.isButton() && interaction.customId === 'open_item_modal') {
    const modal = new ModalBuilder()
      .setCustomId('item_create_modal')
      .setTitle('Yeni Item Oluştur');
    
    const itemNameInput = new TextInputBuilder()
      .setCustomId('item_name')
      .setLabel('Item Adı')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const labelInput = new TextInputBuilder()
      .setCustomId('label')
      .setLabel('Label')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const weightInput = new TextInputBuilder()
      .setCustomId('weight')
      .setLabel('Weight (sayı)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const stackInput = new TextInputBuilder()
      .setCustomId('stack')
      .setLabel('Stack (true/false)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const gorselUrlInput = new TextInputBuilder()
      .setCustomId('gorsel_url')
      .setLabel('Görsel URL (isteğe bağlı)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);
 
    modal.addComponents(
      new ActionRowBuilder().addComponents(itemNameInput),
      new ActionRowBuilder().addComponents(labelInput),
      new ActionRowBuilder().addComponents(weightInput),
      new ActionRowBuilder().addComponents(stackInput),
      new ActionRowBuilder().addComponents(gorselUrlInput)
    );
    await interaction.showModal(modal);
    return;
  }


  if (interaction.isModalSubmit() && interaction.customId === 'item_create_modal') {
    if (!AUTHORIZED_IDS.includes(interaction.user.id)) {
      await interaction.reply({ content: 'Bu işlemi yapmaya yetkin yok.', ephemeral: true });
      return;
    }
    const itemName = interaction.fields.getTextInputValue('item_name');
    const label = interaction.fields.getTextInputValue('label');
    const weight = parseInt(interaction.fields.getTextInputValue('weight'));
    const stack = interaction.fields.getTextInputValue('stack').toLowerCase() === 'true';
    const gorselUrl = interaction.fields.getTextInputValue('gorsel_url') || "";
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
      `    close = false,\n` +
      `    description = "",\n` +
      `    client = {\n` +
      `      image = "${imageFileName}",\n` +
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
    return;
  }
});


registerCommands();
client.login(TOKEN); 
