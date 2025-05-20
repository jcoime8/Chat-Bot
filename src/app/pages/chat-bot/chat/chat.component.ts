import { Component } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ProductosService } from '../services/productos.service';
import { Product } from '../interfaces/productos';
import emailjs from 'emailjs-com';

interface PaymentModel {
  productId?: string;
  productDetails?: {
    title: string;
    price: number;
    thumbnail: string;
  };
  paymentMethod?: 'card' | 'paypal' | 'cash' | 'transfer';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

interface PaymentContext {
  active: boolean;
  step?: 'purchase_confirmation' |
  'payment_method_selection' |
  'card_association_check' |
  'card_selection' |
  'new_card_registration' |
  'payment_processing';
  productId?: string;
}

interface Card {
  id: string;
  banco: string;
  numero: string;
  nombre: string;
  vencimiento: string;
  tipo: 'credit' | 'debit';
  predeterminada: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  messages: { text: string; sender: 'user' | 'bot'; html?: boolean }[] = [];
  userInput = '';
  showChat = false;
  private esperandoRespuestaDeOpciones: boolean = false;

  formData = {
    name: '',
    message: ''
  };

  friendlyResponses = {
    greeting: '¡Hola Cliente! 😊 Bienvenido a nuestra tienda. ¿En qué puedo ayudarte hoy?',
    thanks: '¡De nada, Cliente! 😊 ¿Hay algo más en lo que pueda ayudarte?',
    notUnderstood: 'Lo siento Cliente, no entendí bien tu consulta. ¿Podrías reformularla?',
    defaultOptions: `Aquí tienes algunas preguntas frecuentes:<br><br>
                    <strong>1.</strong> ¿Cómo puedo buscar un producto específico?<br>
                    <strong>2.</strong> ¿Qué métodos de pago aceptan?<br>
                    <strong>3.</strong> ¿Cuál es el tiempo de envío y costo?<br>
                    <strong>4.</strong> ¿Cómo contacto al servicio al cliente?<br>
                    <strong>5.</strong> ¿Dónde se encuentra ubicada la tienda física?<br>
                    <strong>6.</strong> ¿Cuál es el horario de atención al público?<br><br>
                    Para seleccionar una pregunta, escribe el número correspondiente.<br><br>`,
    paymentOptions: `¿Qué método de pago prefieres?<br><br>
                    💳 <strong>Tarjeta</strong> (crédito/débito)<br>
                    📱 <strong>PayPal</strong><br>
                    💰 <strong>Efectivo</strong><br>
                    🏦 <strong>Transferencia</strong> bancaria`
  };


  // Estado de modales
  showCardFormModal = false;
  showCardListModal = false;
  showCustomerServiceModal = false;
  showPaypalModal = false;
  showCashPaymentModal = false;
  showTransferModal = false;

  // Formularios
  cardForm = {
    numero: '',
    nombre: '',
    vencimiento: '',
    cvv: '',
    tipo: 'credit' as 'credit' | 'debit'
  };

  serviceForm = {
    email: '',
    mensaje: '',
    telefono: ''
  };

  currentPayment?: PaymentModel;
  paymentContext: PaymentContext = { active: false };
  tarjetaSeleccionada: Card | null = null;

  tarjetasAsociadas: Card[] = [
    {
      id: '1',
      banco: 'Banco Ficticio 1',
      numero: '**** 1234',
      nombre: 'Titular Ejemplo',
      vencimiento: '12/25',
      tipo: 'credit',
      predeterminada: true
    },
    {
      id: '2',
      banco: 'Banco Ficticio 2',
      numero: '**** 5678',
      nombre: 'Titular Ejemplo',
      vencimiento: '06/24',
      tipo: 'debit',
      predeterminada: false
    }
  ];

  constructor(private productosService: ProductosService) { }

  sendMessage() {
    const input = this.userInput.trim();
    if (!input) return;

    this.messages.push({ text: input, sender: 'user' });
    this.handleBotLogic(input);
    this.userInput = '';

    setTimeout(() => this.scrollChatToBottom());
  }

  toggleChat() {
    this.showChat = !this.showChat;
    if (this.showChat) {
      setTimeout(() => this.scrollChatToBottom());
    }
  }

  buscarporCategoria(categoria: string) {
    this.productosService.getProductosPorCategoria(categoria).subscribe(
      (data) => {
        this.messages.push({
          text: `Aquí tienes los productos de la categoría "${categoria}":<br><br>`,
          sender: 'bot',
          html: true
        });

        data.products.forEach((product: Product) => {
          this.messages.push({
            text: `<strong>${product.title}</strong><br>
                   Precio: $${product.price}<br>
                   ID: ${product.id}<br>
                   <img src="${product.thumbnail}" alt="${product.title}" style="width: 100px; height: auto;"><br><br>`,
            sender: 'bot',
            html: true
          });
        });

        this.scrollChatToBottom();
      }
    );
  }

  categoriaAliasMap: { [key: string]: string } = {
    "belleza": "beauty",
    "perfumes": "fragrances",
    "fragancias": "fragrances",
    "muebles": "furniture",
    "comestibles": "groceries",
    "comida": "groceries",
    "decoración": "home-decoration",
    "decoracion": "home-decoration",
    "accesorios de cocina": "kitchen-accessories",
    "cocina": "kitchen-accessories",
    "laptops": "laptops",
    "notebooks": "laptops",
    "camisas hombre": "mens-shirts",
    "ropa hombre": "mens-shirts",
    "zapatillas hombre": "mens-shoes",
    "zapatos hombre": "mens-shoes",
    "relojes hombre": "mens-watches",
    "accesorios móviles": "mobile-accessories",
    "accesorios": "mobile-accessories",
    "motocicletas": "motorcycle",
    "moto": "motorcycle",
    "cuidado de la piel": "skin-care",
    "piel": "skin-care",
    "celulares": "smartphones",
    "smartphones": "smartphones",
    "teléfonos": "smartphones",
    "deportes": "sports-accessories",
    "accesorios deportivos": "sports-accessories",
    "gafas de sol": "sunglasses",
    "lentes de sol": "sunglasses",
    "tablets": "tablets",
    "tops": "tops",
    "vehículos": "vehicle",
    "vehiculo": "vehicle",
    "bolsos mujer": "womens-bags",
    "carteras mujer": "womens-bags",
    "vestidos mujer": "womens-dresses",
    "ropa mujer": "womens-dresses",
    "joyas mujer": "womens-jewellery",
    "joyería": "womens-jewellery",
    "zapatos mujer": "womens-shoes",
    "zapatillas mujer": "womens-shoes",
    "relojes mujer": "womens-watches"
  };

  private esSaludoAnterior(): boolean {
    const mensajesUsuario = this.messages.filter(msg => msg.sender === 'user');
    if (mensajesUsuario.length === 0) return false;

    const ultimoMensaje = mensajesUsuario[mensajesUsuario.length - 1].text.toLowerCase().trim();
    return /^(hola|buenas|buen día|buenos días|buenas tardes|buenas noches)/i.test(ultimoMensaje);
  }

  respuestaDeInformación = {
    productos: `Puedes consultar productos de las siguientes formas:<br><br>
  • Escribiendo en el chat: <strong>"ver producto [nombre o ID]"</strong> o <strong>"buscar producto [nombre o ID]"</strong>.<br>
  • Utilizando el buscador disponible en la página principal.<br><br>
  También puedes buscar productos por categoría. Para ello:<br>
  1. Escribe en el chat: <strong>"ver categorías"</strong> para obtener la lista disponible.<br>
  2. Luego, escribe el nombre de la categoría para ver los 5 productos más vendidos en esa categoría.<br><br>
  Adicionalmente, puedes explorar categorías desde la página principal utilizando la paginación.<br><br>`,

    pagos: `Puedes realizar pagos mediante los siguientes métodos:<br><br>
  1. Tarjeta de crédito o débito<br>
  2. PayPal<br>
  3. Efectivo<br>
  4. Transferencia bancaria<br><br>
  Para pagar con tarjeta:<br>
  • Escribe en el chat: <strong>"comprar [ID del producto]"</strong>.<br>
  • Si no tienes una tarjeta asociada, puedes escribir: <strong>"registrar tarjeta"</strong> y se mostrará un formulario para completar con tus datos.<br><br>`,

    envios: `Ofrecemos las siguientes opciones de envío:<br><br>
  1. Envío a domicilio<br>
  2. Retiro en un distribuidor autorizado<br><br>`,

    soporte: `Si necesitas ayuda, puedes escribir en el chat: <strong>"ayuda"</strong> o <strong>"soporte"</strong>.<br><br>
  Se mostrará un formulario para que ingreses tus datos de contacto.<br>
  Si no tienes tiempo en este momento, puedes dejar tu mensaje y nos comunicaremos contigo más tarde.<br><br>`,

    direccion: `Nuestra tienda se encuentra en:<br>
  <strong>Av. Ejemplo 123, Ciudad, País</strong>.<br><br>
  Puedes visitarnos de lunes a viernes, de 9:00 a 18:00 horas.`,

    horario: `Nuestro horario de atención es:<br>
  <strong>Lunes a viernes, de 9:00 a 18:00 horas</strong>.<br><br>
  Si necesitas asistencia fuera de este horario, puedes dejar tu mensaje y te responderemos el siguiente día hábil.`
  };




  handleBotLogic(msg: string) {
    const lowerMsg = msg.toLowerCase().trim();
    const userFirstName = 'Cliente';

    if (/^(hola|buenas|buen día|buenas tardes|buenas noches)/i.test(lowerMsg)) {
      this.messages.push({
        text: this.friendlyResponses.greeting + `<br><br>${this.friendlyResponses.defaultOptions}`,
        sender: 'bot',
        html: true
      });
      this.esperandoRespuestaDeOpciones = true; // ← Activar el estado de espera
      return;
    }


    if (this.esperandoRespuestaDeOpciones) {
      switch (lowerMsg) {
        case '1':
          this.messages.push({ text: this.respuestaDeInformación.productos, sender: 'bot', html: true });
          break;
        case '2':
          this.messages.push({ text: this.respuestaDeInformación.pagos, sender: 'bot', html: true });
          break;
        case '3':
          this.messages.push({ text: this.respuestaDeInformación.envios, sender: 'bot', html: true });
          break;
        case '4':
          this.messages.push({ text: this.respuestaDeInformación.soporte, sender: 'bot', html: true });
          break;
        case '5':
          this.messages.push({ text: this.respuestaDeInformación.direccion, sender: 'bot', html: true });
          break;
        case '6':
          this.messages.push({ text: this.respuestaDeInformación.horario, sender: 'bot', html: true });
          break;
        default:
          this.messages.push({ text: 'Por favor selecciona una opción válida del 1 al 6.', sender: 'bot' });
          return;
      }
      this.esperandoRespuestaDeOpciones = false; // ← Reiniciar estado luego de responder
      return;
    }


    if (/^(ver producto|buscar productos|buscar|mostrar productos de|mirar el producto)/i.test(lowerMsg)) {
      const query = lowerMsg
        .replace(/^(ver producto|buscar productos|buscar|mostrar productos de|mirar el producto)/i, '')
        .trim();

      if (!isNaN(Number(query))) {
        this.searchProductById(query);
      } else if (query.length > 0) {
        this.searchByname(query);
      } else {
        this.messages.push({
          text: 'Por favor, dime qué producto deseas buscar (por nombre o ID).',
          sender: 'bot'
        });
      }

      return;
    }


    if (/^(gracias|thank you|gracias por tu ayuda|gracias por la información)/i.test(lowerMsg)) {
      this.messages.push({
        text: this.friendlyResponses.thanks,
        sender: 'bot'
      });
      return;
    }

    if (/^(ayuda|soporte|atención al cliente|contactar servicio)/i.test(lowerMsg)) {
      this.messages.push({
        text: `Claro ${userFirstName}, ¿qué consulta tienes?`,
        sender: 'bot'
      });
      this.showCustomerServiceModal = true;
      return;
    }
    const categoriaSlug = this.categoriaAliasMap[lowerMsg];
    if (categoriaSlug) {
      this.buscarporCategoria(categoriaSlug);
      return;
    }

    // Petición genérica de productos
    if (/^(productos|buscar|categoria|ver productos|ver categorias|categorias)/i.test(lowerMsg)) {
      const listaCategorias = Object.keys(this.categoriaAliasMap)
        .map((cat) => `• ${cat.charAt(0).toUpperCase() + cat.slice(1)}`)
        .join('<br>');

      this.messages.push({
        text: `¿Qué categoría de productos te gustaría ver?<br><br>${listaCategorias}`,
        sender: 'bot',
        html: true
      });
      return;
    }

    for (const alias in this.categoriaAliasMap) {
      if (lowerMsg.includes(alias)) {
        const categoriaSlug = this.categoriaAliasMap[alias];
        this.buscarporCategoria(categoriaSlug);
        return;
      }
    }


    if (/^(comprar|pagar|adquirir|quiero)\s*(?:el|la)?\s*(\d+)/i.test(lowerMsg)) {
      const productId = lowerMsg.match(/(?:comprar|pagar|adquirir|quiero)\s*(?:el|la)?\s*(\d+)/i)?.[1] || '';
      this.initiatePurchaseProcess(productId);
      return;
    }

    if (this.paymentContext.step === 'purchase_confirmation') {
      this.handlePurchaseConfirmation(lowerMsg, userFirstName);
      return;
    }

    if (this.paymentContext.step === 'payment_method_selection') {
      this.handlePaymentMethodSelection(lowerMsg, userFirstName);
      return;
    }

    if (this.paymentContext.step === 'card_association_check') {
      this.handleCardAssociationCheck(lowerMsg, userFirstName);
      return;
    }

    this.handleOtherCommands(lowerMsg, userFirstName, this.friendlyResponses);
  }

  private initiatePurchaseProcess(productId: string) {
    this.searchProductById(productId, true);
  }

  private searchProductById(id: string, forPurchase = false) {
    this.productosService.getProductos().subscribe(
      (data) => {
        const encontrado = data.products.find((p: Product) => p.id.toString() === id);

        if (encontrado) {
          if (forPurchase) {
            this.currentPayment = {
              productId: id,
              productDetails: {
                title: encontrado.title,
                price: encontrado.price,
                thumbnail: encontrado.thumbnail
              },
              paymentStatus: 'pending'
            };

            this.messages.push({
              text: `¿Deseas comprar "<strong>${encontrado.title}</strong>" por <strong>$${encontrado.price}</strong>? (responde "sí" o "no")`,
              sender: 'bot',
              html: true
            });

            this.paymentContext = {
              active: true,
              step: 'purchase_confirmation'
            };
          }
        } else {
          this.messages.push({
            text: `No encontré un producto con el ID "${id}". ¿Quieres verificar el número?`,
            sender: 'bot'
          });
        }
      },
      () => {
        this.messages.push({
          text: 'Parece que hay un problema con nuestro sistema de búsqueda. ¿Podrías intentarlo de nuevo más tarde?',
          sender: 'bot'
        });
      }
    );
  }

  private searchByname(name: string) {
    this.productosService.getProductoPornombre(name).subscribe(
      data => {
        if (data.products && data.products.length > 0) {
          this.messages.push({
            text: `Aquí tienes los productos que coinciden con "${name}":<br><br>`,
            sender: 'bot',
            html: true
          });

          data.products.forEach((product: Product) => {
            this.messages.push({
              text: `<strong>${product.title}</strong><br>
                   Precio: $${product.price}<br>
                   <img src="${product.thumbnail}" alt="${product.title}" style="width: 100px; height: auto;"><br><br>`,
              sender: 'bot',
              html: true
            });
          });
        } else {
          this.messages.push({
            text: `No se encontraron productos con el nombre "${name}".`,
            sender: 'bot'
          });
        }

        this.scrollChatToBottom();
      },
      error => {
        console.error('Error al buscar producto por nombre:', error);
        this.messages.push({
          text: `Ocurrió un error al buscar productos. Por favor, intenta nuevamente más tarde.`,
          sender: 'bot'
        });
      }
    );
  }


  private handlePurchaseConfirmation(response: string, userName: string) {
    if (/^(sí|si|sip|claro|por supuesto|ok)/i.test(response)) {
      this.messages.push({
        text: `Excelente ${userName}. ¿Qué método de pago prefieres?<br><br>
               💳 <strong>Tarjeta</strong> (crédito/débito)<br>
               📱 <strong>PayPal</strong><br>
               💰 <strong>Efectivo</strong><br>
               🏦 <strong>Transferencia</strong> bancaria`,
        sender: 'bot',
        html: true
      });
      this.paymentContext.step = 'payment_method_selection';
    } else if (/^(no|nop|cancelar|ahora no)/i.test(response)) {
      this.messages.push({
        text: `Entendido ${userName}. ¿En qué más puedo ayudarte?`,
        sender: 'bot'
      });
      this.resetPaymentContext();
    } else {
      this.messages.push({
        text: `Perdona ${userName}, no entendí. ¿Deseas proceder con la compra? (responde "sí" o "no")`,
        sender: 'bot'
      });
    }
  }

  private handlePaymentMethodSelection(response: string, userName: string) {
    if (/^(tarjeta|crédito|débito|con tarjeta|pagar con tarjeta)/i.test(response)) {
      this.currentPayment!.paymentMethod = 'card';
      this.messages.push({
        text: `Has seleccionado pago con tarjeta. ¿Tienes una tarjeta asociada a tu cuenta? (responde "sí" o "no")`,
        sender: 'bot'
      });
      this.paymentContext.step = 'card_association_check';
    } else if (/^(paypal|pp|pagar con paypal)/i.test(response)) {
      this.processPaypalPayment(userName);
    } else if (/^(efectivo|en efectivo|con efectivo)/i.test(response)) {
      this.processCashPayment(userName);
    } else if (/^(transferencia|transfer|bancaria)/i.test(response)) {
      this.processBankTransfer(userName);
    } else {
      this.messages.push({
        text: `No entendí tu selección ${userName}. ${this.friendlyResponses.paymentOptions}`,
        sender: 'bot',
        html: true
      });
    }
  }

  private handleCardAssociationCheck(response: string, userName: string) {
    if (/^(sí|si|sip|claro|por supuesto|tengo|ya tengo)/i.test(response)) {
      this.messages.push({ text: `Mostrando tus tarjetas guardadas ${userName}...`, sender: 'bot' });
      this.showCardListModal = true;
      this.paymentContext.step = 'card_selection';
    } else if (/^(no|nop|todavía no|aún no|no tengo|nuev|registrar)/i.test(response)) {
      this.messages.push({
        text: `Vamos a registrar una nueva tarjeta para tu compra ${userName}.`,
        sender: 'bot'
      });
      this.showCardFormModal = true;
      this.paymentContext.step = 'new_card_registration';
    } else {
      this.messages.push({
        text: `Perdona ${userName}, no entendí. ¿Tienes una tarjeta asociada a tu cuenta? (responde "sí" o "no")`,
        sender: 'bot'
      });
    }
  }

  private processPaypalPayment(userName: string) {
    this.currentPayment!.paymentMethod = 'paypal';
    this.currentPayment!.paymentStatus = 'processing';
    this.messages.push({ text: `Redirigiendo a PayPal para completar tu pago ${userName}...`, sender: 'bot' });
    this.showPaypalModal = true;
    this.paymentContext.step = 'payment_processing';
  }

  private processCashPayment(userName: string) {
    this.currentPayment!.paymentMethod = 'cash';
    this.messages.push({
      text: `Para pago en efectivo ${userName}, por favor:<br><br>
             - Visita nuestra tienda física en Plaza Norte, local 102<br>
             - O indica si deseas entrega a domicilio (pago contra entrega)`,
      sender: 'bot',
      html: true
    });
    this.showCashPaymentModal = true;
    this.completePayment();
  }

  private processBankTransfer(userName: string) {
    this.currentPayment!.paymentMethod = 'transfer';
    this.messages.push({
      text: `Para transferencia bancaria ${userName}, estos son nuestros datos:<br><br>
             <strong>Banco:</strong> TuBanco<br>
             <strong>Cuenta:</strong> 123456789<br>
             <strong>CLABE:</strong> 012180012345678912<br><br>
             Una vez realizado el pago, envía el comprobante a ventas@tienda.com`,
      sender: 'bot',
      html: true
    });
    this.showTransferModal = true;
    this.completePayment();
  }

  enviarFormularioTarjeta() {
    const { numero, nombre, vencimiento, cvv, tipo } = this.cardForm;
    if (!numero || !nombre || !vencimiento || !cvv) return;

    const nuevaTarjeta: Card = {
      id: Date.now().toString(),
      banco: 'Nueva Tarjeta',
      numero: '**** ' + numero.slice(-4),
      nombre,
      vencimiento,
      tipo,
      predeterminada: false
    };

    this.tarjetasAsociadas.push(nuevaTarjeta);
    this.tarjetaSeleccionada = nuevaTarjeta;
    this.showCardFormModal = false;

    this.messages.push({
      text: `✅ <strong>Tarjeta registrada exitosamente!</strong><br>
             Tipo: ${tipo === 'credit' ? 'Crédito' : 'Débito'}<br>
             Número: **** ${numero.slice(-4)}<br>
             Nombre: ${nombre}`,
      sender: 'bot',
      html: true
    });

    this.cardForm = {
      numero: '',
      nombre: '',
      vencimiento: '',
      cvv: '',
      tipo: 'credit'
    };

    this.processCardPayment();
  }

  pagarConTarjeta() {
    if (!this.tarjetaSeleccionada) return;
    this.showCardListModal = false;
    this.processCardPayment();
  }

  private processCardPayment() {
    if (!this.currentPayment || !this.tarjetaSeleccionada) return;

    this.currentPayment.paymentStatus = 'processing';

    this.messages.push({
      text: `Procesando pago con tarjeta ${this.tarjetaSeleccionada.banco} ${this.tarjetaSeleccionada.numero}...`,
      sender: 'bot'
    });

    setTimeout(() => {
      this.currentPayment!.paymentStatus = 'completed';
      this.messages.push({
        text: `✅ <strong>Pago completado exitosamente!</strong><br>
               Producto: ${this.currentPayment!.productDetails?.title}<br>
               Monto: $${this.currentPayment!.productDetails?.price}<br>
               Método: Tarjeta ${this.tarjetaSeleccionada?.banco} ${this.tarjetaSeleccionada?.numero}`,
        sender: 'bot',
        html: true
      });
      this.completePayment();
    }, 2000);
  }

  ngOnInit() {
    emailjs.init('lAxfvQ4NWFlQRDFR8');  // tu Public Key aquí
  }

  enviarFormularioServicioCliente(form: NgForm) {
    if (form.invalid) {
      alert('Por favor completa todos los campos.');
      return;
    }

    const templateParams = {
      name: this.formData.name,
      message: this.formData.message,
      time: new Date().toLocaleString()
    };

    emailjs.send(
      'service_vbfo7yj',       // tu Service ID
      'template_bzvjnnb',      // tu Template ID
      templateParams
    )
      .then(() => {
        alert('Mensaje enviado con éxito.');
        this.formData = { name: '', message: '' };
        this.showCustomerServiceModal = false;
      })
      .catch(error => {
        console.error(error);
        alert('Error al enviar el mensaje.');
      });
  }

  private completePayment() {
    this.resetPaymentContext();
    this.tarjetaSeleccionada = null;
  }

  private resetPaymentContext() {
    this.paymentContext = { active: false };
    this.currentPayment = undefined;
  }

  private scrollChatToBottom() {
    const chatBox = document.querySelector('.chat-box');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  private handleOtherCommands(lowerMsg: string, userFirstName: string, friendlyResponses: any) {
    this.messages.push({
      text: friendlyResponses.notUnderstood + '<br><br>' + friendlyResponses.defaultOptions,
      sender: 'bot',
      html: true
    });
  }
}
