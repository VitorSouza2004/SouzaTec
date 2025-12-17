#!/bin/bash
# 🚀 VERIFICAÇÃO RÁPIDA DE SEGURANÇA
# Execute este script para validar que não há credenciais expostas

echo "🔒 SOUZATEC - Verificação de Segurança"
echo "======================================="
echo ""

echo "✓ Procurando por chaves API no código..."
APIKEY_COUNT=$(grep -r "AIza" public/js/ 2>/dev/null | wc -l)
if [ "$APIKEY_COUNT" -eq 0 ]; then
    echo "  ✅ Nenhuma chave API em public/js/ - SEGURO"
else
    echo "  ⚠️  AVISO: Encontradas $APIKEY_COUNT ocorrências de chaves"
fi

echo ""
echo "✓ Verificando credenciais em .env..."
if grep -q "REDACTED" .env && ! grep -q "AIza" .env; then
    echo "  ✅ .env sanitizado - SEGURO"
else
    echo "  ⚠️  AVISO: Verificar .env manualmente"
fi

echo ""
echo "✓ Verificando se /__/firebase/init.json existe..."
if [ -f "__/firebase/init.json" ]; then
    echo "  ✅ init.json presente - OK"
    if grep -q "apiKey" "__/firebase/init.json"; then
        echo "  ℹ️  init.json contém chave real (hospedado no Hosting)"
    fi
else
    echo "  ⚠️  AVISO: init.json não encontrado"
fi

echo ""
echo "✓ Verificando admin.js..."
if ! grep -q "apiKey.*:.*\"" public/js/admin.js; then
    echo "  ✅ Sem chaves hard-coded - SEGURO"
else
    echo "  ⚠️  AVISO: Verificar admin.js"
fi

echo ""
echo "✓ Verificando script.js..."
if ! grep -q "apiKey.*:.*\"" public/js/script.js; then
    echo "  ✅ Sem chaves hard-coded - SEGURO"
else
    echo "  ⚠️  AVISO: Verificar script.js"
fi

echo ""
echo "======================================="
echo "🎯 Verificação Concluída!"
echo ""
echo "📌 Próximos passos:"
echo "  1. Deploy: firebase deploy"
echo "  2. Testar form offline: desabilitar internet e enviar"
echo "  3. Verificar Firestore: console.firebase.google.com"
echo ""
