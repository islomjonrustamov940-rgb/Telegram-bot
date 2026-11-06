const { Telegraf, Markup } = require('telegraf')
const prisma = require('./prisma')

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start(async ctx => {
  const telegramId = BigInt(ctx.from.id)

  let user = await prisma.user.findUnique({ where: { telegramId } })

  if (!user) {
    return ctx.reply(`Salom ${ctx.from.first_name}! Ro'yxatdan o'tish uchun pastdagi tugmani bosing va telefon raqamingizni yuboring.`,
      Markup.keyboard([
        [Markup.button.contactRequest('📞 Telefon raqamni yuborish')]
      ]).resize().oneTime()
    )
  }

  ctx.reply(`Xush kelibsiz, ${ctx.from.first_name}! Ilovadan foydalanish uchun quyidagi tugmani bosing:`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('Ilovani ochish ✅', process.env.WEB_APP_URL)]
    ])
  )
})

bot.command('app', ctx => {
  ctx.reply('Ilovani ochish uchun quyidagi tugmani bosing:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('Ilovani ochish ✅', process.env.WEB_APP_URL)]
    ])
  )
})

bot.help(ctx => ctx.reply(`Yordam uchun administratorga murojaat qiling!`))

bot.on('contact', async ctx => {
  const telegramId = BigInt(ctx.from.id)
  const phone = ctx.message.contact.phone_number
  const name = ctx.from.first_name

  try {
    await prisma.user.upsert({
      where: { telegramId },
      update: { phone, name },
      create: { telegramId, phone, name }
    })

    ctx.reply("✅ Muvafaqiyatli ro'yxatdan o'tdingiz!",
      Markup.inlineKeyboard([
        [Markup.button.url('1-chi kanal', 'https://www.youtube.com/@Islomjon_m24-NOVX')],
        [Markup.button.callback(`✅ Obuna bo'ldim`, 'done')],
      ])
    )
  } catch (error) {
    console.error("Xatolik:", error)
    ctx.reply("Xatolik yuz berdi, iltimos qaytadan urinib ko'ring.")
  }
})

bot.action('done', async ctx => {
  await ctx.answerCbQuery()
  try {
    const member = await ctx.telegram.getChatMember('@fn2_telegram_bot', ctx.from.id)
    const isMember = ['creator', 'administrator', 'member'].includes(member.status) ||
      (member.status === 'restricted' && member.is_member)

    if (!isMember) {
      return ctx.reply("Avval kanalga obuna bo'ling!")
    }

    return ctx.reply("✅ Obuna tasdiqlandi! Endi ilovani ochishingiz mumkin:",
      Markup.inlineKeyboard([
        [Markup.button.webApp('Ilovani ochish ✅', process.env.WEB_APP_URL)]
      ])
    )
  } catch (err) {
    console.error(err)
    ctx.reply("Kanalni tekshirishda xatolik yuz berdi. Bot kanalga admin ekanligini tekshiring.")
  }
})

bot.hears('Salomlashish', ctx => {
  ctx.reply(`Hello ${ctx.from.first_name}`)
})

module.exports = bot
