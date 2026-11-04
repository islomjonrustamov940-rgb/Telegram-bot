const { Telegraf, Markup } = require('telegraf')
const prisma = require('./prisma')


const bot = new Telegraf(process.env.BOT_TOKEN)

// Start
bot.start(ctx => {
  ctx.reply(`Welcome ${ctx.from.first_name} to my first bot`,
    Markup.keyboard([
      Markup.button.contactRequest('📞 Telefon nomerizni kiriting !?')
    ]).resize().oneTime()
  )
})

bot.help(ctx => ctx.reply(`Yordam uchun premium sotib oling  !?`))

bot.on('contact', async ctx => {

  const exsist = await prisma.user.findUnique({ where: { phone: ctx.message.contact.phone_number } })

  if (exsist)
    return ctx.reply("Are you creazy !?",
      Markup.inlineKeyboard([
        [Markup.button.url('1 chi kanal', 'https://www.youtube.com/@Islomjon_m24-NOVX')],
        [Markup.button.callback(`✅ Obuna bo'ldim`, 'done')],
      ]))

  await prisma.user.create({ data: { name: ctx.from.first_name, phone: ctx.message.contact.phone_number } })
  ctx.reply("✅ Muvafaqiyatli royhatdan otingiz !?",
    Markup.inlineKeyboard([
      [Markup.button.url('1 chi kanal', 'https://www.youtube.com/@Islomjon_m24-NOVX')],
      [Markup.button.callback(`✅ Obuna bo'ldim`, 'done')],
    ])
  )
})

bot.action('done', async ctx => {
  await ctx.answerCbQuery()
  const member = await ctx.telegram.getChatMember('@fn2_telegram_bot', ctx.from.id)
  console.log(member)
  const isMember = ['creator', 'administrator', 'member'].includes(member.status) ||
    (member.status === 'restricted' && member.is_member)

  if (!isMember)
    return ctx.reply("Avval kanalga obuna bo'ling !?")

  return ctx.reply("✅ Obuna bo'lganingiz tekshirildi !?")
})

// Salomlashish
bot.hears('Salomlashish', ctx => {
  ctx.reply(` Hello ${ctx.from.first_name}`)
})

module.exports = bot
