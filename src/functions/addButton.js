/**
 * Cria um componente de botão e o adiciona à linha de componentes especificada.
 * @param {import("..").Data} d - O objeto de dados fornecido pelo framework AOI.
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);

    // Log para depuração
    console.log("data.inside:", data.inside, "typeof data.inside:", typeof data.inside);

    // Verifica se data.inside existe e é uma string
    if (!data.inside || typeof data.inside !== "string") {
        return d.aoiError.fnError(
            d,
            "custom",
            { inside: data.inside },
            `Argumentos Inválidos. Esperava-se uma string com argumentos separados por ';'. Recebido: ${JSON.stringify(data.inside)}`
        );
    }

    // Parseia os parâmetros usando split(";")
    let params;
    try {
        params = data.inside.split(";");
    } catch (e) {
        return d.aoiError.fnError(
            d,
            "custom",
            { inside: data.inside },
            `Falha ao dividir argumentos. Esperava-se uma string válida. Erro: ${e.message}`
        );
    }

    const [index, label, style, custom, disabled = "false", emoji] = params;

    // Valida o índice
    if (!index || isNaN(index) || Number(index) < 1) {
        return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Índice Inválido Fornecido");
    }
    const rowIndex = Number(index) - 1;

    // Valida e converte o estilo
    let buttonStyle = isNaN(style) ? d.util.constants.ButtonStyleOptions[style] : Number(style);
    if (!buttonStyle || buttonStyle < 1 || buttonStyle > 6) {
        return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Estilo Inválido Fornecido");
    }

    // Parseia a flag de desativado
    const isDisabled = disabled.toLowerCase() === "true";

    // Trata o emoji
    let emojiSHIPData;
    if (emoji) {
        emojiData = await d.util.getEmoji(d, emoji.addBrackets());
        emojiData = emojiData?.id || emoji?.addBrackets().trim();
    }

    // Cria o objeto do botão
    const button = {
        type: 2, // Tipo de componente de botão
        style: buttonStyle,
        label: label || undefined,
        disabled: isDisabled,
        emoji: emojiData
    };

    // Trata estilos específicos de botão
    if (buttonStyle === 6) { // Botão Premium
        delete button.label;
        delete button.emoji;
        button.sku_id = custom || "";
    } else if (buttonStyle === 5) { // Botão de URL
        if (!custom) {
            return d.aoiError.fnError(d, "custom", { inside: data.inside }, "URL Obrigatória para Botão de Link");
        }
        button.url = custom;
    } else { // Outros tipos de botão
        if (!custom) {
            return d.aoiError.fnError(d, "custom", { inside: data.inside }, "ID Personalizado Obrigatório para Botão Não-Link");
        }
        button.customId = custom;
    }

    // Inicializa a linha de componentes se não existir
    if (!d.components[rowIndex]) {
        d.components[rowIndex] = { type: 1, components: [] };
    }

    // Adiciona o botão à linha de componentes
    d.components[rowIndex].components.push(button);

    return {
        code: d.util.setCode(data)
    };
};
