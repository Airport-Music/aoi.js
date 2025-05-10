/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);

    if (!data.inside || !Array.isArray(data.inside.splits)) {
        return d.aoiError.fnError(d, "custom", {}, "Missing or invalid parameters inside the function.");
    }

    // Desestruturando os parâmetros do comando conforme o formato desejado
    let [newRow, interactionIDorURL, label, style, disabled = "false", emoji, messageID] = data.inside.splits;

    // Verificação do índice da linha (New row?)
    if (newRow.toLowerCase() !== "new row?") {
        return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Invalid format for New row?");
    }

    // Verificando se o índice de estilo é válido
    style = isNaN(style) ? d.util.constants.ButtonStyleOptions?.[style.toUpperCase()] : Number(style);
    if (!style || style > 6 || style < 1) {
        return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Invalid Style Provided In");
    }

    disabled = disabled === "true"; // Se o botão estiver desativado

    // Verificando se a estrutura de componentes existe
    if (!Array.isArray(d.components)) d.components = [];

    let emojiObj;
    if (emoji) {
        const resolvedEmoji = await d.util.getEmoji(d, emoji);
        if (resolvedEmoji?.id) {
            emojiObj = {
                id: resolvedEmoji.id,
                name: resolvedEmoji.name,
                animated: resolvedEmoji.animated ?? false
            };
        } else {
            emojiObj = {
                name: emoji.trim().replace(/^<|>$/g, "") // Remove <> se for apenas o nome do emoji
            };
        }
    }

    // Criando o objeto do botão
    const button = {
        label,
        type: 2,
        style,
        disabled
    };

    if (emojiObj) {
        button.emoji = emojiObj;
    }

    // Dependendo do estilo, adiciona as propriedades específicas
    if (style === 6) { // Product button
        delete button.label;
        delete button.emoji;
        button["sku_id"] = interactionIDorURL; // Uso do ID/URL como SKU
    } else if (style === 5) { // Link button
        button["url"] = interactionIDorURL; // A URL fornecida
    } else { // Custom button
        button["custom_id"] = interactionIDorURL; // Interação personalizada
    }

    // Se o botão for para uma nova linha
    const index = d.components.length; // Adiciona em uma nova linha
    if (!d.components[index]) d.components[index] = { type: 1, components: [] };
    d.components[index].components.push(button);

    return {
        code: d.util.setCode(data)
    };
};
